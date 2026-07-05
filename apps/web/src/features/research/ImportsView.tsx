import React from "react";
import { Upload } from "lucide-react";

export const ImportsView = ({ csvSymbol, setCsvSymbol, csvTimeframe, setCsvTimeframe, setCsvFile, handleCandleImport, setTradeCsvFile, handleTradeImport }: any) => (
  <div className="grid gap-6 md:grid-cols-2 animate-in fade-in duration-500">
    <article className="panel"><div className="panel-heading"><div><p>Market</p><h2>Historical Import</h2></div><Upload size={21} /></div>
      <form className="tool-form" onSubmit={handleCandleImport}><div className="form-grid"><label><span>Symbol</span><input value={csvSymbol} onChange={e => setCsvSymbol(e.target.value)} /></label><label><span>Timeframe</span><select value={csvTimeframe} onChange={e => setCsvTimeframe(e.target.value)}><option>1H</option><option>4H</option><option>D</option></select></label></div><input type="file" onChange={e => setCsvFile(e.target.files?.[0])} /><button className="secondary-button" type="submit">Upload Candles</button></form>
    </article>
    <article className="panel"><div className="panel-heading"><div><p>Broker</p><h2>History Import</h2></div><Upload size={21} /></div>
      <form className="tool-form" onSubmit={handleTradeImport}><input type="file" onChange={e => setTradeCsvFile(e.target.files?.[0])} /><button className="secondary-button" type="submit">Upload Trades</button></form>
    </article>
  </div>
);
