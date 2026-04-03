import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Legend, ReferenceLine, ComposedChart,
} from 'recharts';
import { runSimulation, compareAllAgents, TRAFFIC_PROFILES, AGENTS } from './engine';

// ═══════════════════════════════════════════════════════════════
// Custom Tooltip
// ═══════════════════════════════════════════════════════════════

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(10,12,26,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            backdropFilter: 'blur(20px)',
            fontFamily: "'Inter', sans-serif",
        }}>
            <p style={{ color: '#8892b0', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600 }}>
                Step {label}
            </p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color, fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.8 }}>
                    {entry.name}: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                    </strong>
                </p>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// Metric Card Component
// ═══════════════════════════════════════════════════════════════

const MetricCard = ({ value, label, gradient = 'gradient-cyan', icon, suffix = '' }) => (
    <div className="metric-card">
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
        <div className={`metric-value ${gradient}`}>
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}{suffix}
        </div>
        <div className="metric-label">{label}</div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// Score Badge
// ═══════════════════════════════════════════════════════════════

const ScoreBadge = ({ score }) => {
    const cls = score >= 0.7 ? 'score-high' : score >= 0.4 ? 'score-mid' : 'score-low';
    return (
        <span className={`score-badge ${cls}`}>
            {(score * 100).toFixed(1)}%
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// Background Elements (AI/Tech Theme)
// ═══════════════════════════════════════════════════════════════

const BackgroundElements = () => {
    const robots = ['🤖', '🦾', '🦿', '🛰️', '📟', '💻'];

    return (
        <div className="floating-elements">
            {/* Generate 8 floating robots with random properties */}
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={`robot-${i}`}
                    className="floating-robot"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        '--duration': `${15 + Math.random() * 10}s`,
                        '--x': `${-50 + Math.random() * 100}px`,
                        '--y': `${-50 + Math.random() * 100}px`,
                        '--rot': `${-20 + Math.random() * 40}deg`,
                        fontSize: `${1 + Math.random() * 2}rem`,
                        animationDelay: `${-Math.random() * 10}s`
                    }}
                >
                    {robots[i % robots.length]}
                </div>
            ))}

            {/* Generate 20 floating tech particles */}
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={`tech-${i}`}
                    className="floating-tech"
                    style={{
                        left: `${Math.random() * 100}%`,
                        '--duration': `${5 + Math.random() * 15}s`,
                        animationDelay: `${-Math.random() * 10}s`
                    }}
                />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// Navigation
// ═══════════════════════════════════════════════════════════════

const Navbar = ({ activeSection, onNavigate }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <nav className="navbar" style={scrolled ? { boxShadow: '0 4px 30px rgba(0,0,0,0.4)' } : {}}>
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <div className="navbar-logo">☁️</div>
                    <span className="navbar-title">Cloud Cost Optimizer</span>
                    <span className="navbar-tag">AI</span>
                </div>
                <ul className="navbar-links">
                    {['home', 'simulator', 'compare', 'architecture'].map(s => (
                        <li key={s}>
                            <a
                                href={`#${s}`}
                                className={activeSection === s ? 'active' : ''}
                                onClick={(e) => { e.preventDefault(); onNavigate(s); }}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

// ═══════════════════════════════════════════════════════════════
// Hero Section
// ═══════════════════════════════════════════════════════════════

const Hero = ({ onNavigate }) => (
    <section className="hero" id="home">
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
            <div className="hero-badge">
                <span className="hero-badge-dot" />
                OpenEnv Compatible · Reinforcement Learning
            </div>

            <h1 className="hero-title">
                Intelligent <span className="hero-title-gradient">Cloud Auto-Scaling</span>
                <br />Powered by AI
            </h1>

            <p className="hero-description">
                A production-grade RL environment simulating real-world cloud infrastructure.
                An AI agent manages a fleet of servers, making real-time scaling decisions to
                balance <strong>SLA compliance</strong> against <strong>operational cost</strong> —
                mirroring systems like Kubernetes HPA and AWS Auto Scaling.
            </p>

            <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => onNavigate('simulator')}>
                    🚀 Launch Simulator
                </button>
                <button className="btn btn-secondary" onClick={() => onNavigate('compare')}>
                    📊 Compare Agents
                </button>
                <button className="btn btn-secondary" onClick={() => onNavigate('architecture')}>
                    🏗️ Architecture
                </button>
            </div>

            <div className="hero-stats">
                <div className="hero-stat">
                    <div className="hero-stat-value">5</div>
                    <div className="hero-stat-label">Agent Strategies</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">3</div>
                    <div className="hero-stat-label">Difficulty Levels</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">11D</div>
                    <div className="hero-stat-label">Observation Space</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">0–1</div>
                    <div className="hero-stat-label">Graded Score</div>
                </div>
            </div>
        </div>
    </section>
);

// ═══════════════════════════════════════════════════════════════
// Simulator Section
// ═══════════════════════════════════════════════════════════════

const Simulator = () => {
    const [profile, setProfile] = useState('steady');
    const [agent, setAgent] = useState('threshold');
    const [seed, setSeed] = useState(42);
    const [result, setResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [animStep, setAnimStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setIsAnimating(false);
        setAnimStep(0);
        setTimeout(() => {
            const res = runSimulation(profile, agent, seed);
            setResult(res);
            setIsRunning(false);
            // Start animation
            setIsAnimating(true);
        }, 300);
    }, [profile, agent, seed]);

    // Animate chart data
    useEffect(() => {
        if (!isAnimating || !result) return;
        if (animStep >= result.history.traffic.length) {
            setIsAnimating(false);
            return;
        }
        const timer = setTimeout(() => setAnimStep(prev => Math.min(prev + 4, result.history.traffic.length)), 16);
        return () => clearTimeout(timer);
    }, [isAnimating, animStep, result]);

    const visibleData = useMemo(() => {
        if (!result) return [];
        const len = isAnimating ? animStep : result.history.traffic.length;
        const data = [];
        for (let i = 0; i < len; i++) {
            data.push({
                step: i,
                traffic: result.history.traffic[i],
                served: result.history.served[i],
                servers: result.history.servers[i],
                cpuLoad: result.history.cpuLoad[i] * 100,
                latency: result.history.latency[i],
                dropped: result.history.dropped[i],
                cumCost: result.history.cumCost[i],
            });
        }
        return data;
    }, [result, animStep, isAnimating]);

    return (
        <section className="section" id="simulator">
            <div className="app-container">
                <h2 className="section-title">🚀 Live Simulator</h2>
                <p className="section-subtitle">
                    Configure a traffic scenario and agent strategy, then watch the auto-scaler in action.
                </p>

                {/* Controls */}
                <div className="sim-panel">
                    <div className="sim-panel-header">
                        <div className="sim-panel-title">
                            ⚙️ Simulation Configuration
                        </div>
                        <div className="sim-controls">
                            <div className="control-group">
                                <label className="control-label">Traffic Scenario</label>
                                <select className="control-select" value={profile} onChange={e => setProfile(e.target.value)}>
                                    <option value="steady">🟢 Steady (Easy)</option>
                                    <option value="spike">🟡 Spike (Medium)</option>
                                    <option value="chaos">🔴 Chaos (Hard)</option>
                                </select>
                            </div>
                            <div className="control-group">
                                <label className="control-label">Agent Strategy</label>
                                <select className="control-select" value={agent} onChange={e => setAgent(e.target.value)}>
                                    {Object.entries(AGENTS).map(([key, a]) => (
                                        <option key={key} value={key}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="control-group">
                                <label className="control-label">Seed</label>
                                <input
                                    type="number"
                                    className="control-select"
                                    style={{ width: '80px' }}
                                    value={seed}
                                    onChange={e => setSeed(Number(e.target.value))}
                                    min={1} max={9999}
                                />
                            </div>
                            <div className="control-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={handleRun} disabled={isRunning}
                                    style={{ padding: '10px 28px', fontSize: '0.85rem' }}>
                                    {isRunning ? '⏳ Running...' : '▶ Run Simulation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scenario Info */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span className={`tag tag-${TRAFFIC_PROFILES[profile].difficulty}`}>
                            {TRAFFIC_PROFILES[profile].difficulty}
                        </span>
                        <span className="tag tag-rl">{TRAFFIC_PROFILES[profile].maxSteps} steps</span>
                        <span className="tag tag-rl">{TRAFFIC_PROFILES[profile].spikes.length} spike events</span>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <>
                        {/* Score & Metrics */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '20px',
                                marginBottom: '24px', flexWrap: 'wrap'
                            }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                                    📊 Results: {result.agent} on {result.profile}
                                </h3>
                                <ScoreBadge score={result.scores.total} />
                            </div>

                            <div className="grid-4" style={{ marginBottom: '24px' }}>
                                <MetricCard value={result.scores.total.toFixed(3)} label="Overall Score" gradient="gradient-cyan" icon="🏆" />
                                <MetricCard value={`$${result.metrics.totalCost}`} label="Total Cost" gradient="gradient-green" icon="💰" />
                                <MetricCard value={`${result.metrics.dropRate}%`} label="Drop Rate" gradient="gradient-red" icon="❌" />
                                <MetricCard value={`${result.metrics.avgLatency}ms`} label="Avg Latency" gradient="gradient-orange" icon="⏱️" />
                            </div>

                            <div className="grid-4">
                                <MetricCard value={result.scores.sla.toFixed(3)} label="SLA Score (40%)" gradient="gradient-cyan" icon="🛡️" />
                                <MetricCard value={result.scores.cost.toFixed(3)} label="Cost Score (30%)" gradient="gradient-green" icon="📉" />
                                <MetricCard value={result.scores.latency.toFixed(3)} label="Latency Score (20%)" gradient="gradient-orange" icon="⚡" />
                                <MetricCard value={result.scores.stability.toFixed(3)} label="Stability Score (10%)" gradient="gradient-purple" icon="📐" />
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid-2" style={{ marginBottom: '24px' }}>
                            {/* Traffic Chart */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">📈</span> Traffic vs Served Requests</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <ComposedChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="traffic" fill="rgba(0,210,255,0.1)" stroke="#00d2ff" strokeWidth={2} name="Incoming" />
                                        <Line type="monotone" dataKey="served" stroke="#3a7bd5" strokeWidth={2} dot={false} name="Served" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Servers Chart */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">🖥️</span> Active Servers</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="stepAfter" dataKey="servers" fill="rgba(118,75,162,0.2)" stroke="#764ba2" strokeWidth={2} name="Servers" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* CPU Load */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">📊</span> CPU Load (%)</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} domain={[0, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Scale Up', fill: '#ef4444', fontSize: 10 }} />
                                        <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Scale Down', fill: '#22c55e', fontSize: 10 }} />
                                        <Area type="monotone" dataKey="cpuLoad" fill="rgba(247,151,30,0.15)" stroke="#f7971e" strokeWidth={2} name="CPU %" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Latency */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">⏱️</span> Latency (ms)</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <ComposedChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'SLA: 200ms', fill: '#ef4444', fontSize: 10 }} />
                                        <Area type="monotone" dataKey="latency" fill="rgba(235,51,73,0.1)" stroke="#eb3349" strokeWidth={2} name="Latency (ms)" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Dropped Requests */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">❌</span> Dropped Requests</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="dropped" fill="rgba(239,68,68,0.6)" name="Dropped" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Cumulative Cost */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">💰</span> Cumulative Cost ($)</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={visibleData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="step" stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="cumCost" fill="rgba(150,201,61,0.15)" stroke="#96c93d" strokeWidth={2} name="Cost ($)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="sim-panel" style={{ marginTop: '32px' }}>
                            <div className="sim-panel-title" style={{ marginBottom: '20px' }}>
                                📋 Episode Statistics
                            </div>
                            <div className="grid-4">
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Total Requests</span><br /><strong style={{ fontFamily: "'JetBrains Mono'" }}>{result.metrics.totalRequests.toLocaleString()}</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Served</span><br /><strong style={{ fontFamily: "'JetBrains Mono'", color: '#22c55e' }}>{result.metrics.totalServed.toLocaleString()}</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Dropped</span><br /><strong style={{ fontFamily: "'JetBrains Mono'", color: '#ef4444' }}>{result.metrics.totalDropped.toLocaleString()}</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>SLA Compliance</span><br /><strong style={{ fontFamily: "'JetBrains Mono'", color: '#00d2ff' }}>{result.metrics.slaCompliance}%</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Max Latency</span><br /><strong style={{ fontFamily: "'JetBrains Mono'" }}>{result.metrics.maxLatency} ms</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Avg CPU Load</span><br /><strong style={{ fontFamily: "'JetBrains Mono'" }}>{result.metrics.avgCpu}%</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Peak Servers</span><br /><strong style={{ fontFamily: "'JetBrains Mono'" }}>{result.metrics.peakServers}</strong></div>
                                <div><span style={{ color: '#8892b0', fontSize: '0.75rem' }}>Total Reward</span><br /><strong style={{ fontFamily: "'JetBrains Mono'", color: '#a5b4fc' }}>{result.metrics.totalReward}</strong></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

// ═══════════════════════════════════════════════════════════════
// Agent Comparison Section
// ═══════════════════════════════════════════════════════════════

const CompareSection = () => {
    const [profile, setProfile] = useState('spike');
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const handleCompare = useCallback(() => {
        setIsRunning(true);
        setTimeout(() => {
            const res = compareAllAgents(profile, 42);
            setResults(res);
            setIsRunning(false);
        }, 200);
    }, [profile]);

    const radarData = useMemo(() => {
        if (!results) return [];
        return [
            { metric: 'SLA', ...Object.fromEntries(results.map(r => [r.key, r.scores.sla])) },
            { metric: 'Cost', ...Object.fromEntries(results.map(r => [r.key, r.scores.cost])) },
            { metric: 'Latency', ...Object.fromEntries(results.map(r => [r.key, r.scores.latency])) },
            { metric: 'Stability', ...Object.fromEntries(results.map(r => [r.key, r.scores.stability])) },
        ];
    }, [results]);

    const radarColors = ['#00d2ff', '#764ba2', '#f7971e', '#96c93d', '#eb3349'];

    return (
        <section className="section" id="compare">
            <div className="app-container">
                <h2 className="section-title">📊 Agent Comparison</h2>
                <p className="section-subtitle">
                    Pit all agent strategies against each other on the same traffic scenario.
                </p>

                <div className="sim-panel">
                    <div className="sim-panel-header">
                        <div className="sim-panel-title">🏆 Head-to-Head Battle</div>
                        <div className="sim-controls">
                            <div className="control-group">
                                <label className="control-label">Traffic Scenario</label>
                                <select className="control-select" value={profile} onChange={e => setProfile(e.target.value)}>
                                    <option value="steady">🟢 Steady (Easy)</option>
                                    <option value="spike">🟡 Spike (Medium)</option>
                                    <option value="chaos">🔴 Chaos (Hard)</option>
                                </select>
                            </div>
                            <div className="control-group" style={{ justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={handleCompare} disabled={isRunning}
                                    style={{ padding: '10px 28px', fontSize: '0.85rem' }}>
                                    {isRunning ? '⏳ Comparing...' : '⚔️ Compare All Agents'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {results && (
                    <>
                        {/* Leaderboard Table */}
                        <div className="sim-panel" style={{ overflowX: 'auto' }}>
                            <div className="sim-panel-title" style={{ marginBottom: '20px' }}>
                                🏅 Leaderboard
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Agent</th>
                                        <th>Score</th>
                                        <th>SLA</th>
                                        <th>Cost</th>
                                        <th>Latency</th>
                                        <th>Stability</th>
                                        <th>Cost ($)</th>
                                        <th>Drop Rate</th>
                                        <th>Avg Latency</th>
                                        <th>Peak Servers</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => (
                                        <tr key={r.key}>
                                            <td style={{ fontWeight: 700, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#8892b0' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{r.agent}</td>
                                            <td><ScoreBadge score={r.scores.total} /></td>
                                            <td className="mono">{r.scores.sla.toFixed(3)}</td>
                                            <td className="mono">{r.scores.cost.toFixed(3)}</td>
                                            <td className="mono">{r.scores.latency.toFixed(3)}</td>
                                            <td className="mono">{r.scores.stability.toFixed(3)}</td>
                                            <td className="mono">${r.metrics.totalCost}</td>
                                            <td className="mono" style={{ color: r.metrics.dropRate > 1 ? '#ef4444' : '#22c55e' }}>{r.metrics.dropRate}%</td>
                                            <td className="mono">{r.metrics.avgLatency}ms</td>
                                            <td className="mono">{r.metrics.peakServers}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Radar Chart */}
                        <div className="grid-2" style={{ marginTop: '24px' }}>
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">🎯</span> Performance Radar</div>
                                <ResponsiveContainer width="100%" height={400}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#8892b0', fontSize: 12 }} />
                                        <PolarRadiusAxis tick={{ fill: '#5a6180', fontSize: 10 }} domain={[0, 1]} />
                                        {results.map((r, i) => (
                                            <Radar
                                                key={r.key}
                                                name={r.agent}
                                                dataKey={r.key}
                                                stroke={radarColors[i]}
                                                fill={radarColors[i]}
                                                fillOpacity={0.1}
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#8892b0' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Score Bar Comparison */}
                            <div className="chart-container">
                                <div className="chart-title"><span className="chart-title-icon">📊</span> Overall Scores</div>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={results.map(r => ({ name: r.key, score: r.scores.total * 100 }))} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis type="number" domain={[0, 100]} stroke="#5a6180" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" stroke="#5a6180" tick={{ fontSize: 11 }} width={90} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="score" name="Score %" radius={[0, 6, 6, 0]}>
                                            {results.map((r, i) => (
                                                <rect key={r.key} fill={radarColors[i % radarColors.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

// ═══════════════════════════════════════════════════════════════
// Architecture Section
// ═══════════════════════════════════════════════════════════════

const Architecture = () => (
    <section className="section" id="architecture">
        <div className="app-container">
            <h2 className="section-title">🏗️ System Architecture</h2>
            <p className="section-subtitle">
                How the Cloud Cost Optimizer simulation works — from traffic generation to reward computation.
            </p>

            {/* Pipeline */}
            <div className="arch-flow">
                {[
                    { icon: '📡', label: 'Traffic Generator', sub: 'Workload Patterns' },
                    { icon: '→' },
                    { icon: '🌐', label: 'Environment', sub: 'Server Fleet Sim' },
                    { icon: '→' },
                    { icon: '🤖', label: 'RL Agent', sub: 'Scaling Decisions' },
                    { icon: '→' },
                    { icon: '📊', label: 'Reward Engine', sub: 'Multi-objective Scorer' },
                    { icon: '→' },
                    { icon: '🏆', label: 'Grader', sub: '0.0 – 1.0 Score' },
                ].map((node, i) => (
                    node.label ? (
                        <div className="arch-node" key={i}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{node.icon}</div>
                            <div style={{ fontWeight: 700 }}>{node.label}</div>
                            <div className="arch-node-label">{node.sub}</div>
                        </div>
                    ) : (
                        <span className="arch-arrow" key={i}>{node.icon}</span>
                    )
                ))}
            </div>

            {/* Feature Cards */}
            <div className="grid-3" style={{ marginTop: '40px' }}>
                <div className="card fade-in delay-1">
                    <div className="card-icon card-icon-cyan">📡</div>
                    <div className="card-title">Realistic Traffic Modeling</div>
                    <div className="card-text">
                        5-component signal: sinusoidal seasonality, scheduled flash-sale spikes
                        (bell-curve shaped), random micro-bursts, Gaussian noise, and organic growth trend.
                    </div>
                </div>

                <div className="card fade-in delay-2">
                    <div className="card-icon card-icon-purple">🖥️</div>
                    <div className="card-title">Server Fleet Simulation</div>
                    <div className="card-text">
                        Warm-up delay (3 steps), exponential latency near saturation,
                        hard request dropping beyond capacity, and per-server cost model.
                    </div>
                </div>

                <div className="card fade-in delay-3">
                    <div className="card-icon card-icon-orange">⚡</div>
                    <div className="card-title">Latency Model</div>
                    <div className="card-text">
                        latency = base × e^(cpu_load × k). At low utilization it's fast; near saturation,
                        latency explodes — forcing the agent to scale proactively.
                    </div>
                </div>

                <div className="card fade-in delay-1">
                    <div className="card-icon card-icon-red">🎯</div>
                    <div className="card-title">Multi-Objective Reward</div>
                    <div className="card-text">
                        Dense signal balancing 5 competing objectives: served request reward, server cost,
                        dropped request penalty (100x), latency penalty, and efficiency bonus.
                    </div>
                </div>

                <div className="card fade-in delay-2">
                    <div className="card-icon card-icon-green">📐</div>
                    <div className="card-title">Deterministic Grading</div>
                    <div className="card-text">
                        4-component scoring (0.0–1.0): SLA compliance (40%), cost efficiency (30%),
                        latency quality (20%), and scaling stability (10%). Fully reproducible.
                    </div>
                </div>

                <div className="card fade-in delay-3">
                    <div className="card-icon card-icon-blue">🔌</div>
                    <div className="card-title">OpenEnv Compatible</div>
                    <div className="card-text">
                        Full interface: typed Pydantic Observation/Action/Reward models,
                        step → (obs, reward, done, info), reset → obs, state → full state.
                    </div>
                </div>
            </div>

            {/* Observation Space */}
            <div className="sim-panel" style={{ marginTop: '48px' }}>
                <div className="sim-panel-title" style={{ marginBottom: '20px' }}>
                    👁️ Observation Space (11 dimensions)
                </div>
                <div className="grid-3">
                    {[
                        { name: 'timestep', type: 'int', desc: 'Current time step' },
                        { name: 'incoming_requests', type: 'float', desc: 'Traffic volume (req/s)' },
                        { name: 'active_servers', type: 'int', desc: 'Provisioned server count' },
                        { name: 'warming_up_servers', type: 'int', desc: 'Servers in warm-up' },
                        { name: 'cpu_load', type: 'float [0,1]', desc: 'Fleet CPU utilization' },
                        { name: 'latency_ms', type: 'float', desc: 'Avg response latency' },
                        { name: 'dropped_requests', type: 'float', desc: 'Requests dropped this step' },
                        { name: 'served_requests', type: 'float', desc: 'Requests served this step' },
                        { name: 'cost_so_far', type: 'float', desc: 'Cumulative cost' },
                        { name: 'traffic_trend', type: 'float', desc: 'Traffic rate of change' },
                        { name: 'time_of_day', type: 'float [0,1]', desc: 'Normalized time' },
                    ].map(obs => (
                        <div key={obs.name} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.02)',
                        }}>
                            <code style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.78rem', color: '#a5b4fc', minWidth: '160px' }}>
                                {obs.name}
                            </code>
                            <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>
                                <span style={{ color: '#5a6180', fontSize: '0.7rem' }}>{obs.type}</span>
                                {' — '}{obs.desc}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Space */}
            <div className="sim-panel" style={{ marginTop: '24px' }}>
                <div className="sim-panel-title" style={{ marginBottom: '20px' }}>
                    🎮 Action Space (5 discrete actions)
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>Action</th><th>Delta</th><th>Effect</th></tr>
                    </thead>
                    <tbody>
                        {[
                            ['SCALE_UP_3', '+3', 'Aggressive scaling for spike events'],
                            ['SCALE_UP_1', '+1', 'Cautious proactive scaling'],
                            ['NO_OP', '0', 'Hold current fleet size'],
                            ['SCALE_DOWN_1', '-1', 'Conservative cost optimization'],
                            ['SCALE_DOWN_3', '-3', 'Aggressive cost reduction'],
                        ].map(([action, delta, effect]) => (
                            <tr key={action}>
                                <td><code style={{ fontFamily: "'JetBrains Mono'", color: '#a5b4fc' }}>{action}</code></td>
                                <td className="mono" style={{ color: delta.startsWith('+') ? '#22c55e' : delta === '0' ? '#8892b0' : '#ef4444' }}>{delta}</td>
                                <td style={{ color: '#8892b0' }}>{effect}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reward Formula */}
            <div className="sim-panel" style={{ marginTop: '24px' }}>
                <div className="sim-panel-title" style={{ marginBottom: '16px' }}>
                    🧮 Reward Function
                </div>
                <div className="code-block">
                    <div className="code-block-header">FORMULA</div>
                    R(t) = w₁·ServedRequests - w₂·ServerCost - w₃·DroppedRequests - w₄·LatencyPenalty + w₅·EfficiencyBonus
                    <br /><br />
                    where:<br />
                    {'  '}w₁ = 0.01  (served reward, normalized)<br />
                    {'  '}w₂ = 0.50  (cost penalty — continuous bleed)<br />
                    {'  '}w₃ = 5.00  (drop penalty — CATASTROPHIC)<br />
                    {'  '}w₄ = 0.002 (latency penalty — soft, above 100ms)<br />
                    {'  '}w₅ = 0.10  (efficiency bonus — CPU in 40-75% sweet spot)
                </div>
            </div>
        </div>
    </section>
);


// ═══════════════════════════════════════════════════════════════
// Footer
// ═══════════════════════════════════════════════════════════════

const Footer = () => (
    <footer className="footer">
        <div className="app-container">
            <p style={{ marginBottom: '8px' }}>
                ☁️ <strong>Cloud Cost Optimizer</strong> — AI-Powered Auto-Scaling Simulator
            </p>
            <p>
                Built for OpenEnv Hackathon 2026 · Reinforcement Learning × Cloud Engineering × Systems Design
            </p>
        </div>
    </footer>
);

// ═══════════════════════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════════════════════

export default function App() {
    const [activeSection, setActiveSection] = useState('home');

    const handleNavigate = useCallback((section) => {
        setActiveSection(section);
        const el = document.getElementById(section);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Track scroll position for active nav
    useEffect(() => {
        const sections = ['home', 'simulator', 'compare', 'architecture'];
        const handleScroll = () => {
            const scrollPos = window.scrollY + 150;
            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(sections[i]);
                if (el && el.offsetTop <= scrollPos) {
                    setActiveSection(sections[i]);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <BackgroundElements />
            <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
            <Hero onNavigate={handleNavigate} />
            <Simulator />
            <CompareSection />
            <Architecture />
            <Footer />
        </>
    );
}
