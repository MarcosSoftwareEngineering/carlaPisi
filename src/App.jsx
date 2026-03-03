import React, { useState, useEffect } from 'react';
import fotoDraCarla from './assets/carla.01.jpeg';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle, Heart, ArrowRight, 
  Award, Brain, Star, Sun, Target, Settings, ShieldCheck, 
  PlayCircle, X, Gift, AlertCircle, Quote, BookOpen, UserCheck,
  ChevronLeft, ChevronRight, ShoppingCart, Trash2, CreditCard, QrCode, Loader2, Lock, Unlock
} from 'lucide-react';

// =========================================================
//  LÓGICA DE DADOS (AGORA COM STATUS DE DISPONIBILIDADE)
// =========================================================

const gerarAgendaAutomatica = () => {
  const dias = [];
  const hoje = new Date();
  const horariosBase = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  for (let i = 0; i < 14; i++) {
    const dataFutura = new Date(hoje);
    dataFutura.setDate(hoje.getDate() + i);
    if (dataFutura.getDay() === 0) continue; // Pula domingo
    
    const dataISO = dataFutura.toISOString().split('T')[0];
    
    // Agora cada horário é um objeto com status
    const slots = horariosBase.map(h => ({
      hora: h,
      disponivel: true // Padrão: tudo livre
    }));

    dias.push({ data: dataISO, slots: slots });
  }
  return dias;
};

// DEPOIMENTOS
const DEPOIMENTOS = [
  { id: 1, nome: "Mariana S.", tempo: "Paciente há 8 meses", texto: "A Dra. Carla tem uma escuta única. Eu tinha receio da terapia online, mas me senti tão acolhida quanto no presencial. Hoje consigo lidar muito melhor com minha ansiedade.", foto: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 2, nome: "Ricardo O.", tempo: "Paciente há 1 ano", texto: "Profissional excelente. Me ajudou a passar por um momento de transição de carreira muito difícil com clareza e segurança. Recomendo de olhos fechados.", foto: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 3, nome: "Patrícia L.", tempo: "Paciente há 4 meses", texto: "Cheguei até a Dra. Carla num momento de luto profundo. O acolhimento dela foi fundamental para eu me reencontrar. Gratidão eterna por esse espaço.", foto: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 4, nome: "Lucas M.", tempo: "Paciente há 6 meses", texto: "Estava à beira de um burnout. As sessões me deram ferramentas práticas para impor limites no trabalho e recuperar minha saúde mental e qualidade de vida.", foto: "https://randomuser.me/api/portraits/men/46.jpg" }
];

export default function LandingPageCarlaMenezes() {
  const [modo, setModo] = useState('cliente'); // 'cliente' ou 'admin'
  
  // Agenda agora persiste no LocalStorage para salvar os bloqueios do admin
  const [agenda, setAgenda] = useState(() => {
    const salvo = localStorage.getItem('agenda_carla_v2');
    return salvo ? JSON.parse(salvo) : gerarAgendaAutomatica();
  });

  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horaSelecionada, setHoraSelecionada] = useState(null);
  
  // Estado para o Admin selecionar dia (separado do cliente para não conflitar)
  const [diaAdmin, setDiaAdmin] = useState(null);

  const [agendado, setAgendado] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  // Carrinho
  const [carrinho, setCarrinho] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isProcessing, setIsProcessing] = useState(false);

  // Carrossel
  const [indiceAtual, setIndiceAtual] = useState(0);
  const proximoSlide = () => setIndiceAtual((prev) => (prev === DEPOIMENTOS.length - 1 ? 0 : prev + 1));
  const anteriorSlide = () => setIndiceAtual((prev) => (prev === 0 ? DEPOIMENTOS.length - 1 : prev - 1));

  useEffect(() => {
    const interval = setInterval(proximoSlide, 5000);
    return () => clearInterval(interval);
  }, [indiceAtual]);

  // Salvar agenda sempre que mudar (bloqueios do admin)
  useEffect(() => {
    localStorage.setItem('agenda_carla_v2', JSON.stringify(agenda));
  }, [agenda]);

  // Inicializar seleção
  useEffect(() => {
    if (agenda.length > 0) {
      if (!diaSelecionado) setDiaSelecionado(agenda[0]);
      if (!diaAdmin) setDiaAdmin(agenda[0]);
    }
  }, [agenda]);

  const handlePhone = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    setTelefone(v.substring(0, 15));
  };

  const scrollToBooking = () => document.getElementById('agendamento')?.scrollIntoView({ behavior: 'smooth' });

  // === FUNÇÕES DO CLIENTE ===
  const adicionarSessaoAoCarrinho = (e) => {
    e.preventDefault();
    if (!diaSelecionado || !horaSelecionada || !nome || !telefone) {
      alert("Por favor, preencha todos os dados.");
      return;
    }
    const novoItem = {
      id: Date.now(),
      tipo: "Sessão de Terapia Online",
      data: diaSelecionado.data,
      hora: horaSelecionada.hora, // Pega só a string da hora
      paciente: nome,
      contato: telefone,
      preco: 150.00
    };
    setCarrinho([...carrinho, novoItem]);
    setIsCartOpen(true);
    setCheckoutMode(false);
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(carrinho.filter(item => item.id !== id));
    if (carrinho.length === 1) setCheckoutMode(false);
  };

  const processarPagamento = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAgendado(true);
      setCarrinho([]);
      setIsCartOpen(false);
      setCheckoutMode(false);
      setNome('');
      setTelefone('');
      setHoraSelecionada(null);
    }, 2000);
  };

  // === FUNÇÕES DO ADMIN (BLOQUEIO/DESBLOQUEIO) ===
  const toggleDisponibilidadeSlot = (dataDia, horaSlot) => {
    const novaAgenda = agenda.map(dia => {
      if (dia.data === dataDia) {
        const novosSlots = dia.slots.map(slot => {
          if (slot.hora === horaSlot) {
            return { ...slot, disponivel: !slot.disponivel };
          }
          return slot;
        });
        return { ...dia, slots: novosSlots };
      }
      return dia;
    });
    setAgenda(novaAgenda);
    
    // Atualiza o dia selecionado no admin para refletir a mudança visualmente na hora
    const diaAtualizado = novaAgenda.find(d => d.data === dataDia);
    setDiaAdmin(diaAtualizado);
  };

  const toggleDiaInteiro = (dataDia, bloquear) => {
    const novaAgenda = agenda.map(dia => {
      if (dia.data === dataDia) {
        const novosSlots = dia.slots.map(slot => ({ ...slot, disponivel: !bloquear }));
        return { ...dia, slots: novosSlots };
      }
      return dia;
    });
    setAgenda(novaAgenda);
    const diaAtualizado = novaAgenda.find(d => d.data === dataDia);
    setDiaAdmin(diaAtualizado);
  };

  // FORMATADORES
  const getDiaSemana = (dataIso) => {
    const date = new Date(dataIso + "T00:00:00");
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  };
  const getDiaMes = (dataIso) => {
    const date = new Date(dataIso + "T00:00:00");
    return date.toLocaleDateString('pt-BR', { day: '2-digit' });
  };
  const formatarDataLegivel = (dataIso) => {
    const date = new Date(dataIso + "T00:00:00");
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco, 0);

  // TELA DE SUCESSO
  if (agendado) {
    return (
      <div className="container centered">
        <div className="success-card-full animate-fade">
          <CheckCircle size={80} color="var(--gold)" style={{margin: '0 auto 20px'}} />
          <h2>Pagamento Aprovado!</h2>
          <p>Sua vaga está garantida. Você receberá o link da videochamada no seu WhatsApp em instantes.</p>
          <button className="btn-cta" style={{marginTop: '20px'}} onClick={() => setAgendado(false)}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  // === RENDERIZAÇÃO ===
  return (
    <div className="lp-container-main">
      {/* HEADER */}
      <header className="lp-navbar-fixed">
        <div className="container navbar-content">
          <div className="logo-area">
            <Brain size={28} className="gold-text" />
            <span className="logo-text">Dra. Carla Menezes</span>
          </div>
          <div className="nav-actions">
            {modo === 'cliente' ? (
              <>
                <button className="btn-nav-outline" onClick={scrollToBooking}>Agendar</button>
                <div className="cart-wrapper" onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart size={24} color="#fff" />
                  {carrinho.length > 0 && <span className="cart-badge-count">{carrinho.length}</span>}
                </div>
              </>
            ) : (
              <span className="admin-badge">MODO ADMINISTRADOR</span>
            )}
          </div>
        </div>
      </header>

      {modo === 'admin' ? (
        // ==========================================
        // ÁREA DO ADMINISTRADOR
        // ==========================================
        <div className="admin-dashboard container animate-fade">
          <div className="admin-header-panel">
            <h2>Gestão de Agenda</h2>
            <p>Clique nos horários para bloquear (vermelho) ou liberar (verde).</p>
            <button onClick={() => setModo('cliente')} className="btn-nav-outline">Sair do Admin</button>
          </div>

          <div className="booking-glass-layout admin-layout">
            <div className="selection-column">
              <h3>Selecione o Dia para Gerenciar</h3>
              <div className="date-scroller">
                {agenda.map(dia => (
                  <button key={dia.data} className={`date-pill ${diaAdmin?.data === dia.data ? 'active' : ''}`}
                    onClick={() => setDiaAdmin(dia)}>
                    <span className="pill-weekday">{getDiaSemana(dia.data)}</span>
                    <span className="pill-day">{getDiaMes(dia.data)}</span>
                  </button>
                ))}
              </div>
            </div>

            {diaAdmin && (
              <div className="admin-slots-column">
                <div className="slots-header">
                  <h3>Horários de {formatarDataLegivel(diaAdmin.data)}</h3>
                  <div className="admin-bulk-actions">
                    <button className="btn-small-action block" onClick={() => toggleDiaInteiro(diaAdmin.data, true)}><Lock size={14}/> Bloquear Dia</button>
                    <button className="btn-small-action unblock" onClick={() => toggleDiaInteiro(diaAdmin.data, false)}><Unlock size={14}/> Liberar Dia</button>
                  </div>
                </div>
                
                <div className="time-grid">
                  {diaAdmin.slots.map((slot, index) => (
                    <button 
                      key={index} 
                      className={`time-chip admin-chip ${slot.disponivel ? 'available' : 'blocked'}`}
                      onClick={() => toggleDisponibilidadeSlot(diaAdmin.data, slot.hora)}
                    >
                      {slot.hora}
                      {slot.disponivel ? <CheckCircle size={14}/> : <X size={14}/>}
                    </button>
                  ))}
                </div>
                <div className="admin-legend">
                  <span className="legend-item"><span className="dot green"></span> Disponível no Site</span>
                  <span className="legend-item"><span className="dot red"></span> Bloqueado (Indisponível)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ==========================================
        // ÁREA DO CLIENTE (SITE NORMAL)
        // ==========================================
        <>
          {/* SIDEBAR DO CARRINHO */}
          {isCartOpen && (
            <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
              <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
                <div className="cart-header">
                  <h3>
                    {checkoutMode ? 
                      <span onClick={() => setCheckoutMode(false)} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                        <ChevronLeft size={20}/> Pagamento
                      </span> : `Seu Carrinho (${carrinho.length})`
                    }
                  </h3>
                  <button className="btn-close-cart" onClick={() => setIsCartOpen(false)}><X size={24}/></button>
                </div>
                
                <div className="cart-body">
                  {carrinho.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingCart size={48} style={{opacity: 0.3}}/>
                      <p>Seu carrinho está vazio.</p>
                      <button className="btn-text-gold" onClick={() => { setIsCartOpen(false); scrollToBooking(); }}>Agendar agora</button>
                    </div>
                  ) : !checkoutMode ? (
                    carrinho.map(item => (
                      <div key={item.id} className="cart-item animate-fade">
                        <div className="cart-item-header">
                          <strong>{item.tipo}</strong>
                          <button onClick={() => removerDoCarrinho(item.id)} className="btn-remove"><Trash2 size={16}/></button>
                        </div>
                        <div className="cart-item-details">
                          <p><CalendarIcon size={14}/> {formatarDataLegivel(item.data)}</p>
                          <p><Clock size={14}/> {item.hora}</p>
                          <p><UserCheck size={14}/> {item.paciente}</p>
                        </div>
                        <div className="cart-item-price">R$ {item.preco.toFixed(2).replace('.', ',')}</div>
                      </div>
                    ))
                  ) : (
                    <div className="checkout-container animate-fade">
                      <div className="payment-tabs">
                        <button className={`payment-tab ${paymentMethod === 'credit' ? 'active' : ''}`} onClick={() => setPaymentMethod('credit')}><CreditCard size={18}/> Cartão</button>
                        <button className={`payment-tab ${paymentMethod === 'pix' ? 'active' : ''}`} onClick={() => setPaymentMethod('pix')}><QrCode size={18}/> Pix</button>
                      </div>
                      {paymentMethod === 'credit' ? (
                        <div className="credit-card-form">
                          <div className="input-group"><label>Número do Cartão</label><input type="text" placeholder="0000 0000 0000 0000" className="lp-input-dark" /></div>
                          <div className="input-group"><label>Nome no Cartão</label><input type="text" placeholder="Como no cartão" className="lp-input-dark" /></div>
                          <div className="row-inputs">
                            <div className="input-group"><label>Validade</label><input type="text" placeholder="MM/AA" className="lp-input-dark" /></div>
                            <div className="input-group"><label>CVV</label><input type="text" placeholder="123" className="lp-input-dark" /></div>
                          </div>
                        </div>
                      ) : (
                        <div className="pix-container">
                          <div className="qr-placeholder"><QrCode size={100} color="var(--gold)"/></div>
                          <p>Escaneie o QR Code ou use o copia e cola.</p>
                          <button className="btn-copy-pix">Copiar Código Pix</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {carrinho.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total"><span>Total a pagar</span><strong>R$ {totalCarrinho.toFixed(2).replace('.', ',')}</strong></div>
                    {!checkoutMode ? (
                      <button className="btn-cta w-100" onClick={() => setCheckoutMode(true)}>IR PARA PAGAMENTO</button>
                    ) : (
                      <button className="btn-cta w-100" onClick={processarPagamento} disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="spin" size={20}/> PROCESSANDO...</> : 'FINALIZAR COMPRA'}
                      </button>
                    )}
                    <p className="secure-checkout"><ShieldCheck size={12}/> Ambiente 100% Seguro</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HERO */}
          <section className="hero-section-pro">
            <div className="container hero-grid">
              <div className="hero-text-content">
                <div className="badge-lp"><Heart size={14} fill="currentColor" /> Atendimento Humanizado</div>
                <h1 className="dr-name-header">Psicologia Clínica</h1>
                <h2 className="main-headline">Cuide da sua <span className="gold-text">saúde emocional</span> com atendimento personalizado</h2>
                <p className="main-subtitle">Através de uma escuta qualificada, utilizo minha experiência clínica para guiar você em um processo de autoconhecimento e <strong>transformação pessoal</strong>.</p>
                <div className="hero-buttons">
                  <button className="btn-cta" onClick={scrollToBooking}>AGENDAR MINHA SESSÃO <ArrowRight size={20}/></button>
                  <div className="hero-stats">
                    <span><Award size={16} color="var(--gold)"/> CRP 03/12345</span>
                    <span><CheckCircle size={16} color="var(--gold)"/> +10 anos de experiência</span>
                  </div>
                </div>
              </div>
              <div className="hero-image-container">
                <div className="photo-frame">
                  <img src={fotoDraCarla} alt="Dra. Carla Menezes" className="dr-photo" />
                  <div className="photo-accent"></div>
                </div>
              </div>
            </div>
          </section>

          {/* FAIXA DE CREDIBILIDADE */}
          <section className="authority-strip">
            <div className="container authority-grid">
              <div className="auth-item"><ShieldCheck size={24} className="gold-text" /><div><strong>Registro Ativo</strong><span>CRP Regularizado</span></div></div>
              <div className="auth-item"><BookOpen size={24} className="gold-text" /><div><strong>Especialista TCC</strong><span>Pós-graduação</span></div></div>
              <div className="auth-item"><UserCheck size={24} className="gold-text" /><div><strong>+2k Sessões</strong><span>Experiência Online</span></div></div>
            </div>
          </section>

          {/* VÍDEO */}
          <section className="showcase-section-pro">
            <div className="container showcase-grid">
              <div className="showcase-content">
                <span className="section-tag gold-text">Como Funciona</span>
                <h2 className="showcase-title">Terapia online com o mesmo <span className="gold-text">acolhimento</span> do presencial.</h2>
                <p className="showcase-description">Descubra como o acompanhamento psicológico online pode se adaptar perfeitamente à sua rotina. Um espaço seguro para você falar sobre o que realmente importa.</p>
                <ul className="benefits-list">
                  <li><ShieldCheck size={24} color="var(--gold)" /> Sigilo absoluto e segurança</li>
                  <li><Heart size={24} color="var(--gold)" /> Sessões humanizadas por vídeo</li>
                  <li><Clock size={24} color="var(--gold)" /> Flexibilidade para sua rotina</li>
                </ul>
              </div>
              <div className="showcase-media-wrapper" onClick={() => setIsVideoOpen(true)}>
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80" alt="Atendimento Online" className="showcase-image"/>
                <div className="play-overlay"><PlayCircle size={72} color="var(--gold)" strokeWidth={1.5} /></div>
              </div>
            </div>
          </section>

          {isVideoOpen && (
            <div className="video-modal-overlay" onClick={() => setIsVideoOpen(false)}>
              <button className="btn-close-video" onClick={() => setIsVideoOpen(false)}><X size={40} color="#000" /></button>
              <div className="video-modal-content" onClick={e => e.stopPropagation()}>
                <video src="https://www.w3schools.com/html/mov_bbb.mp4" controls autoPlay className="real-video-player" />
              </div>
            </div>
          )}

          {/* CARROSSEL */}
          <section className="testimonials-section">
            <div className="container">
              <div className="section-header-centered">
                <span className="section-tag gold-text">Depoimentos</span>
                <h2 className="section-title">Histórias de Transformação</h2>
              </div>
              <div className="carousel-container">
                <button className="nav-btn left" onClick={anteriorSlide}><ChevronLeft size={24}/></button>
                <div className="carousel-viewport">
                  <div className="carousel-track" style={{ transform: `translateX(-${indiceAtual * 100}%)` }}>
                    {DEPOIMENTOS.map((depoimento) => (
                      <div key={depoimento.id} className="carousel-slide">
                        <div className="testimonial-card-carousel">
                          <div className="stars-row">{[...Array(5)].map((_, i) => (<Star key={i} size={18} fill="var(--gold)" color="var(--gold)" />))}</div>
                          <p className="testimonial-text">"{depoimento.texto}"</p>
                          <div className="patient-info-card">
                            <img src={depoimento.foto} alt={depoimento.nome} className="patient-photo" />
                            <div className="patient-details"><strong>{depoimento.nome}</strong><span>{depoimento.tempo}</span></div>
                            <div className="verified-badge"><CheckCircle size={14}/></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="nav-btn right" onClick={proximoSlide}><ChevronRight size={24}/></button>
              </div>
              <div className="carousel-dots">{DEPOIMENTOS.map((_, idx) => (<span key={idx} className={`dot ${idx === indiceAtual ? 'active' : ''}`} onClick={() => setIndiceAtual(idx)}></span>))}</div>
            </div>
          </section>

          {/* BENEFÍCIOS */}
          <section className="benefits-section-pro">
            <div className="container">
              <div className="section-header-centered"><h2 className="section-title">Como posso te ajudar</h2></div>
              <div className="benefits-grid-pro">
                <div className="benefit-card-pro"><div className="benefit-icon"><Brain size={32}/></div><h4>Ansiedade</h4><p>Técnicas para gerenciar o estresse.</p></div>
                <div className="benefit-card-pro"><div className="benefit-icon"><Star size={32}/></div><h4>Autoestima</h4><p>Desenvolva uma relação mais gentil consigo.</p></div>
                <div className="benefit-card-pro"><div className="benefit-icon"><Sun size={32}/></div><h4>Transições</h4><p>Apoio para lidar com novos ciclos.</p></div>
                <div className="benefit-card-pro"><div className="benefit-icon"><Target size={32}/></div><h4>Autoconhecimento</h4><p>Tome decisões mais seguras.</p></div>
              </div>
            </div>
          </section>

          {/* OFERTA IRRESISTÍVEL */}
          <section className="offer-section-special">
            <div className="container">
              <div className="offer-card-frame">
                <div className="offer-badge-top"><AlertCircle size={16}/> SOMENTE HOJE: ÚLTIMAS 2 VAGAS</div>
                <div className="offer-grid-internal">
                  <div className="offer-text-side">
                    <h2 className="offer-heading">Inicie sua jornada hoje com <span className="gold-text">Segurança Total</span></h2>
                    <p className="offer-sub">Preparei uma condição especial para remover todos os riscos para você dar esse passo hoje.</p>
                    <div className="bonuses-list">
                      <div className="bonus-item"><div className="bonus-icon"><Gift size={24} /></div><div><strong className="gold-text">BÔNUS EXCLUSIVO (Gratuito)</strong><p>Ganhe meu E-book: <em>"Guia Prático: 5 Passos para Controlar a Ansiedade"</em>.</p></div></div>
                      <div className="bonus-item"><div className="bonus-icon"><ShieldCheck size={24} /></div><div><strong className="gold-text">GARANTIA DE CONEXÃO</strong><p>Se não se sentir acolhida(o) na 1ª sessão, devolvo 100% do valor.</p></div></div>
                    </div>
                  </div>
                  <div className="offer-cta-side">
                    <div className="price-tag-big"><span className="price-label">Investimento por sessão</span><div className="price-value">R$ 150,00</div><span className="price-bonus">+ Bônus e Garantia Inclusos</span></div>
                    <button className="btn-cta btn-pulse" onClick={scrollToBooking}>GARANTIR MINHA VAGA <ArrowRight size={20}/></button>
                    <p className="scarcity-text">* Agenda sujeita a lotação.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AGENDAMENTO */}
          <section id="agendamento" className="booking-section-pro">
            <div className="container">
              <div className="section-header-centered">
                <h2 className="section-title">Finalize sua Reserva</h2>
                <p style={{color: 'var(--text-muted)'}}>Escolha o melhor horário e adicione ao carrinho.</p>
              </div>
              <div className="booking-glass-layout">
                <div className="booking-main-grid">
                  <div className="selection-column">
                    <div className="step-card">
                      <h3><CalendarIcon size={20} className="gold-text" style={{marginRight: '8px'}}/> 1. Escolha a data</h3>
                      <div className="date-scroller">
                        {agenda.map(dia => (
                          <button key={dia.data} className={`date-pill ${diaSelecionado?.data === dia.data ? 'active' : ''}`}
                            onClick={() => { setDiaSelecionado(dia); setHoraSelecionada(null); }}>
                            <span className="pill-weekday">{getDiaSemana(dia.data)}</span>
                            <span className="pill-day">{getDiaMes(dia.data)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={`step-card ${!diaSelecionado ? 'disabled' : ''}`}>
                      <h3><Clock size={20} className="gold-text" style={{marginRight: '8px'}}/> 2. Escolha o horário</h3>
                      <div className="time-grid">
                        {diaSelecionado?.slots.map((slot, idx) => (
                          <button 
                            key={idx} 
                            disabled={!slot.disponivel}
                            className={`time-chip ${horaSelecionada?.hora === slot.hora ? 'active' : ''} ${!slot.disponivel ? 'blocked' : ''}`}
                            onClick={() => setHoraSelecionada(slot)}
                          >
                            {slot.hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={`form-column ${!horaSelecionada ? 'locked' : ''}`}>
                    <div className="summary-card-pro">
                      <h3>3. Seus Dados</h3>
                      <form onSubmit={adicionarSessaoAoCarrinho}>
                        <input type="text" required placeholder="Nome Completo" className="lp-input" 
                               value={nome} onChange={(e) => setNome(e.target.value)} />
                        <input type="tel" required placeholder="WhatsApp para contato" className="lp-input" 
                               value={telefone} onChange={handlePhone} />
                        <div className="price-box"><span>Total hoje:</span><strong className="gold-text">R$ 150,00</strong></div>
                        <button type="submit" className="btn-confirm-final btn-pulse" disabled={!horaSelecionada}>ADICIONAR E PAGAR</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <footer style={{textAlign: 'center', padding: '60px 20px', background: '#0f1115', borderTop: '1px solid #222'}}>
            <p style={{color: '#666', fontSize: '14px'}}>© 2026 Dra. Carla Menezes. Todos os direitos reservados.</p>
            <button onClick={() => setModo('admin')} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#444', marginTop: '10px'}}><Settings size={14}/></button>
          </footer>
        </>
      )}

      {/* CSS 100% INJETADO */}
      <style dangerouslySetInnerHTML={{ __html: LP_PRO_STYLES }} />
    </div>
  );
}

const LP_PRO_STYLES = `
  :root { 
    --primary: #7c9d96; 
    --bg-dark: #0f1115; 
    --bg-card: #1a1d24;
    --text-main: #f3f4f6; 
    --text-muted: #9ca3af; 
    --border-color: rgba(255,255,255,0.08);
    --gold: #d4af37; 
    --gold-hover: #e0be4f;
    --red-blocked: #ef4444;
    --green-avail: #10b981;
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden !important; width: 100%; max-width: 100vw; }
  body { font-family: 'Inter', sans-serif; background: var(--bg-dark); color: var(--text-main); }
  
  .lp-container-main { width: 100%; overflow-x: hidden; padding-top: 80px; }
  .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; width: 100%; }
  .centered { display: flex; align-items: center; justify-content: center; min-height: 80vh; }
  
  .success-card-full { background: var(--bg-card); padding: 50px; border-radius: 30px; text-align: center; border: 1px solid var(--gold); box-shadow: 0 20px 50px rgba(212, 175, 55, 0.1); }
  
  /* HEADER FIXO */
  .lp-navbar-fixed { 
    position: fixed; top: 0; left: 0; width: 100%; height: 80px; 
    background: rgba(15, 17, 21, 0.95); backdrop-filter: blur(12px); 
    border-bottom: 1px solid var(--border-color); z-index: 1000; 
    display: flex; align-items: center;
  }
  .navbar-content { display: flex; justify-content: space-between; align-items: center; }
  .logo-area { display: flex; align-items: center; gap: 10px; }
  .logo-text { font-weight: 800; font-size: 18px; color: #fff; letter-spacing: 0.5px; }
  .nav-actions { display: flex; align-items: center; gap: 20px; }
  .btn-nav-outline { 
    background: transparent; border: 1px solid var(--gold); color: var(--gold); 
    padding: 8px 24px; border-radius: 50px; font-weight: 600; cursor: pointer; transition: 0.3s; 
  }
  .btn-nav-outline:hover { background: var(--gold); color: #000; }
  .admin-badge { background: #ef4444; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; }
  
  .cart-wrapper { position: relative; cursor: pointer; display: flex; align-items: center; transition: 0.2s; }
  .cart-wrapper:hover { transform: scale(1.1); }
  .cart-badge-count { 
    position: absolute; top: -8px; right: -8px; background: var(--gold); 
    color: #000; font-size: 10px; font-weight: 800; width: 18px; height: 18px; 
    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
  }

  /* SIDEBAR DO CARRINHO */
  .cart-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(3px); z-index: 2000; display: flex; justify-content: flex-end; }
  .cart-sidebar { width: 100%; max-width: 420px; background: #13161c; height: 100%; border-left: 1px solid var(--border-color); display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.5); animation: slideIn 0.3s ease; }
  .cart-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
  .cart-header h3 { color: #fff; margin: 0; font-size: 18px; display: flex; align-items: center; }
  .btn-close-cart { background: transparent; border: none; color: #fff; cursor: pointer; }
  .cart-body { flex: 1; padding: 20px; overflow-y: auto; }
  .empty-cart { text-align: center; color: var(--text-muted); margin-top: 50px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .btn-text-gold { background: none; border: none; color: var(--gold); text-decoration: underline; cursor: pointer; font-size: 14px; }
  
  /* ESTILOS DE PAGAMENTO (CHECKOUT) */
  .payment-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
  .payment-tab { flex: 1; padding: 12px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-muted); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; transition: 0.3s; }
  .payment-tab.active { border-color: var(--gold); color: var(--gold); background: rgba(212,175,55,0.1); }
  
  .credit-card-form { display: flex; flex-direction: column; gap: 15px; }
  .input-group label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 5px; }
  .lp-input-dark { width: 100%; padding: 12px; background: var(--bg-dark); border: 1px solid var(--border-color); border-radius: 8px; color: #fff; outline: none; }
  .lp-input-dark:focus { border-color: var(--gold); }
  .row-inputs { display: flex; gap: 15px; }
  .row-inputs .input-group { flex: 1; }
  
  .pix-container { text-align: center; padding: 20px; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--gold); }
  .qr-placeholder { background: #fff; padding: 10px; display: inline-block; border-radius: 8px; margin-bottom: 15px; }
  .btn-copy-pix { background: transparent; border: 1px solid var(--gold); color: var(--gold); padding: 8px 16px; border-radius: 50px; cursor: pointer; font-size: 13px; margin-top: 10px; }
  
  .cart-item { background: var(--bg-card); border: 1px solid var(--border-color); padding: 15px; border-radius: 12px; margin-bottom: 15px; }
  .cart-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
  .cart-item-header strong { color: var(--gold); font-size: 14px; }
  .btn-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; }
  .cart-item-details p { margin: 4px 0; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
  .cart-item-price { text-align: right; font-weight: 800; font-size: 16px; color: #fff; margin-top: 10px; }
  
  .cart-footer { padding: 20px; border-top: 1px solid var(--border-color); background: var(--bg-card); }
  .cart-total { display: flex; justify-content: space-between; align-items: center; font-size: 18px; color: #fff; margin-bottom: 20px; }
  .w-100 { width: 100%; }
  .secure-checkout { text-align: center; font-size: 11px; color: #10b981; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; }
  
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }

  /* HERO */
  .hero-section-pro { padding: clamp(60px, 10vh, 100px) 0 clamp(50px, 8vh, 80px); background: linear-gradient(135deg, #0a0b0e 0%, var(--bg-dark) 100%); }
  .hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: clamp(40px, 5vw, 60px); align-items: center; }
  .badge-lp { display: inline-flex; align-items: center; gap: 8px; background: rgba(124,157,150,0.15); color: var(--primary); padding: 8px 20px; border-radius: 50px; font-weight: 700; margin-bottom: 20px; font-size: 13px; }
  .dr-name-header { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: var(--text-muted); margin-bottom: 10px; }
  .main-headline { font-size: clamp(28px, 5vw, 48px); font-weight: 800; line-height: 1.1; margin: 20px 0; color: #fff; }
  .main-subtitle { font-size: 18px; line-height: 1.6; color: var(--text-muted); margin-bottom: 30px; }
  .dr-photo { width: 100%; border-radius: 30px; border: 4px solid var(--bg-card); position: relative; z-index: 2; }
  .photo-frame { position: relative; }
  .photo-accent { position: absolute; width: 100%; height: 100%; background: var(--gold); border-radius: 30px; top: 20px; right: -20px; z-index: 1; opacity: 0.6; }
  .btn-cta { background: var(--gold); color: #000; border: none; padding: 18px 35px; border-radius: 12px; font-weight: 800; text-transform: uppercase; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
  .btn-cta:hover { background: var(--gold-hover); transform: translateY(-3px); }
  .hero-stats { display: flex; gap: 15px; margin-top: 25px; font-size: 13px; color: var(--text-muted); font-weight: 600; flex-wrap: wrap; }

  /* AUTHORITY */
  .authority-strip { padding: 30px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); }
  .authority-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
  .auth-item { display: flex; align-items: center; gap: 12px; justify-content: center; }
  .auth-item strong { display: block; color: #fff; font-size: 14px; }
  .auth-item span { color: var(--text-muted); font-size: 12px; }

  /* SHOWCASE */
  .showcase-section-pro { padding: 80px 0; }
  .showcase-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .showcase-title { font-size: clamp(28px, 4vw, 36px); margin-bottom: 20px; color: #fff; }
  .showcase-description { color: var(--text-muted); line-height: 1.6; margin-bottom: 30px; }
  .gold-text { color: var(--gold); }
  .benefits-list { list-style: none; display: flex; flex-direction: column; gap: 15px; }
  .benefits-list li { display: flex; align-items: center; gap: 12px; font-weight: 500; }
  .showcase-media-wrapper { position: relative; border-radius: 20px; overflow: hidden; cursor: pointer; border: 1px solid var(--border-color); }
  .showcase-image { width: 100%; display: block; transition: 0.5s; }
  .showcase-media-wrapper:hover .showcase-image { transform: scale(1.05); }
  .play-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
  .video-modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
  .video-modal-content { width: 90%; max-width: 900px; aspect-ratio: 16/9; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 0 50px rgba(212,175,55,0.2); }
  .real-video-player { width: 100%; height: 100%; }
  .btn-close-video { position: absolute; top: 20px; right: 20px; background: var(--gold); border: none; border-radius: 50%; width: 50px; height: 50px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

  /* CARROSSEL */
  .testimonials-section { padding: 80px 0; border-top: 1px solid var(--border-color); background: #13161c; }
  .carousel-container { position: relative; display: flex; align-items: center; justify-content: center; max-width: 900px; margin: 0 auto; gap: 20px; }
  .carousel-viewport { overflow: hidden; width: 100%; max-width: 700px; border-radius: 24px; position: relative; }
  .carousel-track { display: flex; transition: transform 0.5s ease-in-out; width: 100%; }
  .carousel-slide { min-width: 100%; box-sizing: border-box; padding: 10px; display: flex; justify-content: center; }
  
  .testimonial-card-carousel { background: var(--bg-card); padding: 40px; border-radius: 24px; border: 1px solid var(--border-color); text-align: center; width: 100%; min-height: 320px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); position: relative; }
  
  .stars-row { display: flex; gap: 4px; margin-bottom: 20px; }
  .testimonial-text { font-size: 18px; font-style: italic; color: #fff; line-height: 1.6; margin-bottom: 30px; }
  
  .patient-info-card { display: flex; align-items: center; gap: 15px; text-align: left; background: rgba(255,255,255,0.03); padding: 10px 20px; border-radius: 50px; border: 1px solid var(--border-color); }
  .patient-photo { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold); }
  .patient-details strong { display: block; color: #fff; font-size: 15px; }
  .patient-details span { font-size: 12px; color: var(--text-muted); }
  .verified-badge { color: var(--gold); }

  .nav-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--gold); width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; flex-shrink: 0; z-index: 2; }
  .nav-btn:hover { background: var(--gold); color: #000; transform: scale(1.1); }
  .carousel-dots { display: flex; gap: 8px; margin-top: 20px; justify-content: center; }
  .dot { width: 10px; height: 10px; background: rgba(255,255,255,0.1); border-radius: 50%; cursor: pointer; transition: 0.3s; }
  .dot.active { background: var(--gold); transform: scale(1.2); }

  /* BENEFÍCIOS E OUTROS */
  .benefits-section-pro { padding: 80px 0; border-top: 1px solid var(--border-color); }
  .section-header-centered { text-align: center; margin-bottom: 50px; }
  .section-tag { color: var(--gold); font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; display: block; margin-bottom: 10px; }
  .section-title { font-size: 36px; color: #fff; }
  .benefits-grid-pro { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
  .benefit-card-pro { background: var(--bg-card); padding: 30px; border-radius: 20px; border: 1px solid var(--border-color); }
  .benefit-icon { width: 50px; height: 50px; background: rgba(124,157,150,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; border-radius: 12px; margin-bottom: 20px; }
  .benefit-card-pro h4 { color: #fff; font-size: 18px; margin-bottom: 10px; }
  .benefit-card-pro p { color: var(--text-muted); font-size: 14px; line-height: 1.5; }

  /* OFFER SECTION (HARMONIZADA) */
  .offer-section-special { padding: 80px 0; border-top: 1px solid var(--border-color); background: linear-gradient(180deg, var(--bg-dark) 0%, #13161c 100%); }
  .offer-card-frame { border: 2px solid var(--gold); border-radius: 24px; background: rgba(212, 175, 55, 0.03); padding: 40px; position: relative; }
  .offer-badge-top { position: absolute; top: 0; left: 50%; transform: translate(-50%, 0); background: #ef4444; color: #fff; padding: 8px 20px; border-radius: 0 0 12px 12px; font-weight: 800; font-size: 12px; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(239,68,68,0.3); }
  
  .offer-grid-internal { display: grid; grid-template-columns: 1.2fr 1fr; gap: 50px; margin-top: 30px; align-items: center; }
  
  .offer-heading { font-size: 32px; color: #fff; margin-bottom: 15px; }
  .offer-sub { color: var(--text-muted); margin-bottom: 30px; font-size: 16px; }
  .bonuses-list { display: flex; flex-direction: column; gap: 15px; }
  .bonus-item { display: flex; gap: 15px; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.2); }
  .bonus-icon { color: #000; background: var(--gold); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .bonus-item strong { color: var(--gold); font-size: 14px; display: block; margin-bottom: 4px; }
  .bonus-item p { color: var(--text-muted); font-size: 13px; margin: 0; }

  .offer-cta-side { background: rgba(0,0,0,0.4); padding: 30px; border-radius: 20px; border: 1px solid var(--border-color); text-align: center; }
  .price-label { font-size: 13px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
  .price-value { font-size: 42px; font-weight: 800; color: var(--gold); margin: 10px 0; }
  .price-bonus { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #fff; }
  .scarcity-text { color: #ef4444; font-size: 12px; font-weight: 700; margin-top: 15px; }
  .btn-pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }

  /* ADMIN AREA */
  .admin-dashboard { padding-top: 40px; padding-bottom: 80px; }
  .admin-header-panel { text-align: center; margin-bottom: 40px; }
  .admin-header-panel h2 { color: #fff; font-size: 28px; margin-bottom: 10px; }
  .admin-header-panel p { color: var(--text-muted); margin-bottom: 20px; }
  .admin-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; min-height: 500px; }
  .admin-slots-column { background: rgba(255,255,255,0.03); padding: 25px; border-radius: 20px; border: 1px solid var(--border-color); }
  .slots-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
  .slots-header h3 { font-size: 18px; color: #fff; margin: 0; }
  .admin-bulk-actions { display: flex; gap: 10px; }
  .btn-small-action { border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; text-transform: uppercase; transition: 0.2s; }
  .btn-small-action.block { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; }
  .btn-small-action.block:hover { background: #ef4444; color: #fff; }
  .btn-small-action.unblock { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
  .btn-small-action.unblock:hover { background: #10b981; color: #fff; }
  
  .time-chip.admin-chip { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; }
  .time-chip.available { background: rgba(16, 185, 129, 0.15); border-color: #10b981; color: #10b981; }
  .time-chip.available:hover { background: rgba(16, 185, 129, 0.3); }
  .time-chip.blocked { background: rgba(239, 68, 68, 0.15); border-color: #ef4444; color: #ef4444; opacity: 0.7; }
  .time-chip.blocked:hover { background: rgba(239, 68, 68, 0.3); opacity: 1; }
  .time-chip.blocked.active { /* Sobrescreve estilo do cliente */ cursor: pointer; } 
  .admin-legend { display: flex; gap: 20px; margin-top: 25px; justify-content: center; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); }
  .dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot.green { background: #10b981; box-shadow: 0 0 5px #10b981; }
  .dot.red { background: #ef4444; box-shadow: 0 0 5px #ef4444; }

  /* ESTILOS DE HORÁRIO BLOQUEADO (CLIENTE) */
  .time-chip.blocked { background: rgba(255,255,255,0.05); border-color: #333; color: #555; text-decoration: line-through; cursor: not-allowed; opacity: 0.5; }
  .time-chip.blocked:hover { transform: none; box-shadow: none; border-color: #333; }

  /* BOOKING */
  .booking-section-pro { padding: 80px 0; background: var(--bg-dark); }
  .booking-glass-layout { background: var(--bg-card); padding: 40px; border-radius: 30px; border: 1px solid var(--border-color); }
  .booking-main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
  .date-pill { padding: 15px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-main); border-radius: 12px; min-width: 80px; cursor: pointer; }
  .date-pill.active { background: var(--gold); color: #000; border-color: var(--gold); }
  .time-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; }
  .time-chip { padding: 10px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-main); border-radius: 8px; cursor: pointer; transition: 0.2s; font-weight: 600; }
  .time-chip:hover { border-color: var(--gold); transform: translateY(-2px); }
  .time-chip.active { background: var(--gold); color: #000; border-color: var(--gold); }
  
  .summary-card-pro { background: rgba(0,0,0,0.3); padding: 30px; border-radius: 20px; border: 1px solid var(--gold); }
  .lp-input { width: 100%; padding: 15px; background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; margin-bottom: 15px; border-radius: 8px; outline: none; }
  .lp-input:focus { border-color: var(--gold); }
  .price-box { display: flex; justify-content: space-between; padding: 15px; background: rgba(212,175,55,0.1); border-radius: 8px; margin: 20px 0; color: #fff; }
  .btn-confirm-final { width: 100%; padding: 18px; background: var(--gold); border: none; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s; color: #000; }
  .btn-confirm-final:disabled { opacity: 0.5; cursor: not-allowed; animation: none; }

  /* RESPONSIVIDADE */
  @media (max-width: 1024px) {
    .hero-grid, .showcase-grid, .offer-grid-internal, .booking-main-grid, .admin-layout { grid-template-columns: 1fr; text-align: center; }
    .hero-image-container, .showcase-media-wrapper { order: -1; margin: 0 auto; max-width: 600px; }
    .photo-accent { right: 0; left: 20px; }
    .offer-cta-side { margin-top: 30px; }
    .benefits-list { display: inline-block; text-align: left; }
    .carousel-container { gap: 10px; }
    .carousel-viewport { max-width: 100%; }
    .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: rgba(0,0,0,0.6); }
    .nav-btn.left { left: 0; } .nav-btn.right { right: 0; }
    .auth-item { flex-direction: column; text-align: center; }
  }
`;