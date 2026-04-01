import React, { useState } from 'react';
import { Activity, AlertCircle, AlertOctagon, Ghost, BarChart3, Search, ChevronLeft, ChevronRight, Download, CheckCircle, XCircle } from 'lucide-react';

import historicoDados from './data/historico.json';
import dispositivosDados from './data/dispositivos.json';
import './App.css';

const App: React.FC = () => {
  const hoje = historicoDados[historicoDados.length - 1] || {
    "total_analisado": 0, "comunicou_hoje": 0, "nao_comunicou_hoje": 0, 
    "mais_7_dias": 0, "mais_15_dias": 0, "mais_30_dias": 0, "mais_90_dias": 0
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredData = dispositivosDados.filter((item: any) => {
    const imeiMatch = String(item.imei).toLowerCase().includes(searchTerm.toLowerCase());
    const contratoMatch = String(item.contrato_natural).toLowerCase().includes(searchTerm.toLowerCase());
    return imeiMatch || contratoMatch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const exportToExcel = () => {
    const headers = ['IMEI', 'Chave Natural', 'Ultima Comunicacao'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((item: any) => {
      csvRows.push(`"${item.imei}","${item.contrato_natural}","${item.ultima_localizacao}"`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `extracao_zeus.csv`);
    link.click();
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>⚡ Zeus Analytics | <span>Monitoramento Loovi</span></h1>
      </header>

      <main className="main-content">
        <div className="kpi-grid">
          <div className="kpi-card total">
            <div className="kpi-header"><BarChart3 size={20} /><h3>Analisados</h3></div>
            <p className="kpi-value">{hoje.total_analisado}</p>
          </div>

          {/* 🟢 NOVOS CARDS */}
          <div className="kpi-card success">
            <div className="kpi-header"><CheckCircle size={20} /><h3>Comunicou Hoje</h3></div>
            <p className="kpi-value">{hoje.comunicou_hoje}</p>
          </div>

          <div className="kpi-card offline-today">
            <div className="kpi-header"><XCircle size={20} /><h3>Não Comunicou</h3></div>
            <p className="kpi-value">{hoje.nao_comunicou_hoje}</p>
          </div>

          {/* CARDS DE HISTÓRICO */}
          <div className="kpi-card info">
            <div className="kpi-header"><Activity size={20} /><h3>&gt; 7 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_7_dias}</p>
          </div>
          <div className="kpi-card warning">
            <div className="kpi-header"><AlertCircle size={20} /><h3>&gt; 15 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_15_dias}</p>
          </div>
          <div className="kpi-card alert">
            <div className="kpi-header"><AlertOctagon size={20} /><h3>&gt; 30 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_30_dias}</p>
          </div>
          <div className="kpi-card danger">
            <div className="kpi-header"><Ghost size={20} /><h3>&gt; 90 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_90_dias}</p>
          </div>
        </div>

        <div className="table-section">
          <div className="table-header">
            <h2>Investigação de Dispositivos</h2>
            <div className="table-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
              </div>
              <button className="export-btn" onClick={exportToExcel}><Download size={18} /> Exportar</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>IMEI</th><th>Chave Natural</th><th>Última Comunicação</th></tr></thead>
              <tbody>
                {currentItems.map((item: any, i) => (
                  <tr key={i}>
                    <td className="font-mono">{item.imei}</td>
                    <td>{item.contrato_natural}</td>
                    <td><span className={`status-badge ${item.ultima_localizacao.includes('API') ? 'offline' : 'online'}`}>{item.ultima_localizacao}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft size={18} /> Anterior</button>
              <span>{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Próxima <ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;