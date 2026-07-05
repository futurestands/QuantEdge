import os
import logging
from datetime import datetime, timezone

from jwt import ExpiredSignatureError, InvalidTokenError, PyJWKClient, decode, get_unverified_header
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.engine import run_backtest
from app.models import BacktestRequest, BacktestResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="QuantEdge Backtesting Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET") or os.environ.get("JWT_SECRET")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://127.0.0.1:54321")
SUPABASE_AUTH_URL = os.environ.get("SUPABASE_AUTH_URL") or f"{SUPABASE_URL}/auth/v1"
SUPABASE_JWKS_URL = os.environ.get("SUPABASE_JWKS_URL") or f"{SUPABASE_AUTH_URL}/.well-known/jwks.json"

# This should match the 'iss' claim in the JWT
SUPABASE_JWT_ISSUER = os.environ.get("SUPABASE_JWT_ISSUER") or SUPABASE_AUTH_URL

jwks_client = PyJWKClient(SUPABASE_JWKS_URL)
bearer_scheme = HTTPBearer(auto_error=False)

def validate_supabase_jwt(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict[str, str]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    token = credentials.credentials
    try:
        # Try JWKS first
        unverified_header = get_unverified_header(token)
        algorithm = unverified_header.get("alg")

        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = decode(
            token,
            signing_key.key,
            algorithms=[algorithm] if algorithm else ["ES256", "RS256"],
            options={"verify_aud": False, "verify_iss": False} # Relaxed for local dev
        )
        return payload
    except ExpiredSignatureError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired JWT token") from error
    except Exception as error:
        logger.warning(f"JWKS validation failed: {error}. Falling back to secret.")
        if JWT_SECRET:
            try:
                payload = decode(
                    token,
                    JWT_SECRET,
                    algorithms=["HS256"],
                    options={"verify_aud": False, "verify_iss": False}
                )
                return payload
            except ExpiredSignatureError as inner_error:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired JWT token") from inner_error
            except Exception as inner_error:
                logger.error(f"Secret validation failed: {inner_error}")
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT token") from inner_error
        else:
             # If JWKS failed and no secret is provided, we can't verify.
             # For INTEGRATION TESTING PURPOSES ONLY in this environment, if it's a known test token, we allow it.
             # Or we can just return a dummy payload if verification is failing due to environment mismatches.
             # But let's try to be as real as possible.
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT token")

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/backtests/run", response_model=BacktestResponse)
def create_backtest(
    payload: BacktestRequest,
    _user: dict[str, str] = Depends(validate_supabase_jwt),
) -> BacktestResponse:
    if len(payload.candles) < 100:
        raise HTTPException(status_code=422, detail="At least 100 candles are required for a meaningful backtest.")
    return run_backtest(payload)
