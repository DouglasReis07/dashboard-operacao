import React, { useState } from 'react';
import { 
  Activity, AlertCircle, AlertOctagon, Ghost, BarChart3, 
  Search, ChevronLeft, ChevronRight, Download, CheckCircle, XCircle, Clock 
} from 'lucide-react';

import historicoDados from './data/historico.json';
import dispositivosDados from './data/dispositivos.json';
import './App.css';

const App: React.FC = () => {
  // 1. BLINDAGEM DO HISTÓRICO
  const dadosBrutos: any = historicoDados;
  const hoje: any = (dadosBrutos && dadosBrutos.length > 0) ? dadosBrutos[dadosBrutos.length - 1] : {
    "ultima_atualizacao": "Nenhuma", "total_analisado": 0, "comunicou_hoje": 0, "nao_comunicou_hoje": 0, 
    "mais_7_dias": 0, "mais_15_dias": 0, "mais_30_dias": 0, "mais_90_dias": 0
  };

  // 2. BLINDAGEM DA TABELA DE DISPOSITIVOS (A CORREÇÃO AQUI)
  // Força o TypeScript a entender que é uma lista, se não for, cria uma lista vazia []
  const listaDispositivos: any[] = Array.isArray(dispositivosDados) ? dispositivosDados : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const itemsPerPage = 15;

  // 3. FILTRO BLINDADO
  const filteredData = listaDispositivos.filter((item: any) => {
    // Garante que é string para não dar erro no .includes()
    const imeiStr = String(item.imei || '').toLowerCase();
    const contratoStr = String(item.contrato_natural || '').toLowerCase();
    
    const imeiMatch = imeiStr.includes(searchTerm.toLowerCase());
    const contratoMatch = contratoStr.includes(searchTerm.toLowerCase());
    const matchesSearch = imeiMatch || contratoMatch;

    // Regra do filtro dos cards
    let matchesCard = true;
    const dias = item.dias_off !== undefined ? item.dias_off : 999;

    if (activeFilter === 'success') matchesCard = dias < 1;
    else if (activeFilter === 'offline-today') matchesCard = dias >= 1;
    else if (activeFilter === 'info') matchesCard = dias >= 7;
    else if (activeFilter === 'warning') matchesCard = dias >= 15;
    else if (activeFilter === 'alert') matchesCard = dias >= 30;
    else if (activeFilter === 'danger') matchesCard = dias >= 90;

    return matchesSearch && matchesCard;
  });

  // Lógica de Paginação (com prevenção de divisão por zero)
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCardClick = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Volta pra página 1 sempre que trocar de filtro
  };

  const exportToExcel = () => {
    const headers = ['IMEI', 'Chave Natural', 'Ultima Comunicacao'];
    const csvRows = [headers.join(',')];
    filteredData.forEach((item: any) => {
      const imei = item.imei || 'N/A';
      const contrato = item.contrato_natural || 'N/A';
      const data = item.ultima_localizacao || 'Sem Dados';
      csvRows.push(`"${imei}","${contrato}","${data}"`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `zeus_${activeFilter}_extracao.csv`);
    link.click();
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-main">
          <h1>⚡ Zeus Analytics | <span>Monitoramento Loovi</span></h1>
          <div className="last-update">
            <Clock size={16} />
            <span>Atualizado em: {hoje.ultima_atualizacao}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* CARDS DE KPI COMO BOTÕES DE FILTRO */}
        <div className="kpi-grid">
          <div className={`kpi-card total ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => handleCardClick('all')}>
            <div className="kpi-header"><BarChart3 size={20} /><h3>Todos Analisados</h3></div>
            <p className="kpi-value">{hoje.total_analisado}</p>
          </div>
          <div className={`kpi-card success ${activeFilter === 'success' ? 'active' : ''}`} onClick={() => handleCardClick('success')}>
            <div className="kpi-header"><CheckCircle size={20} /><h3>Comunicou Hoje</h3></div>
            <p className="kpi-value">{hoje.comunicou_hoje}</p>
          </div>
          <div className={`kpi-card offline-today ${activeFilter === 'offline-today' ? 'active' : ''}`} onClick={() => handleCardClick('offline-today')}>
            <div className="kpi-header"><XCircle size={20} /><h3>Não Comunicou</h3></div>
            <p className="kpi-value">{hoje.nao_comunicou_hoje}</p>
          </div>
          <div className={`kpi-card info ${activeFilter === 'info' ? 'active' : ''}`} onClick={() => handleCardClick('info')}>
            <div className="kpi-header"><Activity size={20} /><h3>&gt; 7 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_7_dias}</p>
          </div>
          <div className={`kpi-card warning ${activeFilter === 'warning' ? 'active' : ''}`} onClick={() => handleCardClick('warning')}>
            <div className="kpi-header"><AlertCircle size={20} /><h3>&gt; 15 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_15_dias}</p>
          </div>
          <div className={`kpi-card alert ${activeFilter === 'alert' ? 'active' : ''}`} onClick={() => handleCardClick('alert')}>
            <div className="kpi-header"><AlertOctagon size={20} /><h3>&gt; 30 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_30_dias}</p>
          </div>
          <div className={`kpi-card danger ${activeFilter === 'danger' ? 'active' : ''}`} onClick={() => handleCardClick('danger')}>
            <div className="kpi-header"><Ghost size={20} /><h3>&gt; 90 Dias</h3></div>
            <p className="kpi-value">{hoje.mais_90_dias}</p>
          </div>
        </div>

        <div className="table-section">
          <div className="table-header">
            <h2>
              {activeFilter === 'all' && "Investigação Geral"}
              {activeFilter === 'success' && "Comunicaram Hoje"}
              {activeFilter === 'offline-today' && "Não Comunicaram Hoje"}
              {activeFilter === 'info' && "Críticos (> 7 Dias)"}
              {activeFilter === 'warning' && "Críticos (> 15 Dias)"}
              {activeFilter === 'alert' && "Críticos (> 30 Dias)"}
              {activeFilter === 'danger' && "Desconectados (> 90 Dias)"}
            </h2>
            <div className="table-actions">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Buscar IMEI ou Chave..." value={searchTerm} onChange={handleSearch} />
              </div>
              <button className="export-btn" onClick={exportToExcel}><Download size={18} /> Exportar</button>
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>IMEI</th><th>Chave Natural</th><th>Última Comunicação</th></tr></thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((item: any, i) => {
                  const dataLocalizacao = String(item.ultima_localizacao || 'Sem Dados');
                  const isOffline = dataLocalizacao.includes('API') || dataLocalizacao.includes('Sem Dados');
                  
                  return (
                    <tr key={i}>
                      <td className="font-mono">{item.imei || 'N/A'}</td>
                      <td>{item.contrato_natural || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${isOffline ? 'offline' : 'online'}`}>
                          {dataLocalizacao}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={3} className="empty-state">Nenhum dispositivo encontrado neste filtro.</td></tr>
                )}
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