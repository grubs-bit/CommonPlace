import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Bookmark, Cloud, Download, FilePlus, FolderOpen, Home, Lightbulb, Moon, Network, Plus, RotateCcw, Save, Search, Settings, StickyNote, Sun, Trash2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import { createIdea, createNote, emptyData, formatTags, parseTags, touch } from './lib/data';
import { buildTopicGraph, filterTopicGraph } from './lib/graph';
import { cloudProviderOptions, cloudStatusForPath } from './lib/cloud';
import { searchAll } from './lib/search';
import { exportItemToMarkdown, markdownFileName } from './lib/export';
import { addBookmark, removeBookmark } from './lib/bookmarks';
import { createSampleLibrary, isLibraryEmpty } from './lib/sampleLibrary';
import { nextTheme, readStoredTheme, storeTheme } from './lib/theme';
import appIcon from '../assets/commonplace-app-icon.png';
import './styles.css';

const api = window.commonplace;
const nav = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb },
  { id: 'graph', label: 'Topic Graph', icon: Network },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function App() {
  const [libraryPath, setLibraryPath] = useState(null);
  const [data, setData] = useState(emptyData());
  const [active, setActive] = useState('dashboard');
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');
  const [status, setStatus] = useState('Starting…');
  const [theme, setTheme] = useState(() => readStoredTheme(window.localStorage));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    storeTheme(window.localStorage, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => nextTheme(current));

  useEffect(() => {
    api.init().then((result) => {
      setLibraryPath(result.libraryPath);
      setData(result.data || emptyData());
      setStatus(result.libraryPath ? 'Ready' : 'Choose a library folder to begin');
    });
  }, []);

  const persist = async (nextData) => {
    setData(nextData);
    if (!libraryPath) return;
    await api.saveData(nextData);
    setStatus('Saved');
    window.setTimeout(() => setStatus('Ready'), 900);
  };

  const chooseLibrary = async () => {
    const result = await api.chooseLibrary();
    if (!result) return;
    setLibraryPath(result.libraryPath);
    setData(result.data || emptyData());
    setStatus('Library connected');
  };

  const addNote = async () => {
    const note = createNote();
    await persist({ ...data, notes: [note, ...data.notes] });
    setSelected(note.id);
    setActive('notes');
  };

  const addIdea = async () => {
    const idea = createIdea();
    await persist({ ...data, ideas: [idea, ...data.ideas] });
    setSelected(idea.id);
    setActive('ideas');
  };

  const addFiles = async () => {
    if (!libraryPath) return chooseLibrary();
    const result = await api.addFiles();
    if (!result) return;
    setData(result.data);
    setActive('library');
    setStatus(`Imported ${result.imported.length} file${result.imported.length === 1 ? '' : 's'}`);
  };

  const loadSampleLibrary = async () => {
    const sample = createSampleLibrary();
    await persist(sample);
    setData(sample);
    setStatus('Sample library loaded');
  };

  const createBackup = async () => {
    const backupPath = await api.createBackup();
    if (backupPath) setStatus(`Backup created: ${backupPath}`);
  };

  const restoreBackup = async () => {
    const result = await api.restoreBackup();
    if (!result) return;
    setData(result.data);
    setStatus('Backup restored');
  };

  const results = useMemo(() => searchAll(data, query, searchFilter), [data, query, searchFilter]);

  if (!libraryPath) {
    return <Welcome onChoose={chooseLibrary} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-icon" src={appIcon} alt="Commonplace" />
          <div>
            <h1>Commonplace</h1>
            <p>Study operating system</p>
          </div>
        </div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="library-path" title={libraryPath}>{libraryPath}</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="searchbox">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search every note, idea, PDF and import…" />
          </div>
          <button className="icon-button" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={addNote}><Plus size={16} /> Note</button>
          <button onClick={addIdea}><Plus size={16} /> Idea</button>
          <button className="primary" onClick={addFiles}><FilePlus size={16} /> Add files</button>
        </header>

        {query ? (
          <SearchView results={results} filter={searchFilter} setFilter={setSearchFilter} openResult={(result) => {
            setQuery('');
            setSelected(result.id);
            setActive(result.type === 'note' ? 'notes' : result.type === 'idea' ? 'ideas' : 'library');
          }} />
        ) : (
          <>
            {active === 'dashboard' && <Dashboard data={data} setActive={setActive} setSelected={setSelected} addNote={addNote} addIdea={addIdea} addFiles={addFiles} loadSampleLibrary={loadSampleLibrary} />}
            {active === 'library' && <Library data={data} persist={persist} addFiles={addFiles} selected={selected} setSelected={setSelected} />}
            {active === 'notes' && <Notes data={data} persist={persist} selected={selected} setSelected={setSelected} addNote={addNote} />}
            {active === 'ideas' && <Ideas data={data} persist={persist} selected={selected} setSelected={setSelected} addIdea={addIdea} />}
            {active === 'graph' && <TopicGraph data={data} setActive={setActive} setSelected={setSelected} />}
            {active === 'settings' && <SettingsView libraryPath={libraryPath} chooseLibrary={chooseLibrary} openLibrary={() => api.openLibrary()} createBackup={createBackup} restoreBackup={restoreBackup} status={status} theme={theme} toggleTheme={toggleTheme} />}
          </>
        )}
      </main>
    </div>
  );
}

function Welcome({ onChoose, theme, toggleTheme }) {
  return (
    <div className="welcome">
      <button className="theme-floating" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Light' : 'Dark'}</button>
      <section>
        <img className="welcome-icon" src={appIcon} alt="Commonplace icon" />
        <p className="eyebrow">LOCAL-FIRST STUDY SYSTEM</p>
        <h1>Commonplace</h1>
        <p>A sharper academic workspace for PDFs, markdown notes, ideas, topics, and search. No AI. No account. Your library lives wherever you choose.</p>
        <button className="primary big" onClick={onChoose}><FolderOpen size={18} /> Choose library folder</button>
      </section>
    </div>
  );
}

function Dashboard({ data, setActive, setSelected, addNote, addIdea, addFiles, loadSampleLibrary }) {
  const recent = [...data.notes.map(x => ({ ...x, kind: 'note' })), ...data.ideas.map(x => ({ ...x, kind: 'idea' })), ...data.files.map(x => ({ ...x, kind: 'file' }))]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 6);
  if (isLibraryEmpty(data)) {
    return <div className="page"><PageTitle title="Start your library" subtitle="Build a study workspace from notes, PDFs, ideas, and topics." />
      <section className="card onboarding-grid">
        <button onClick={addNote}><StickyNote size={22} /><strong>Create a note</strong><span>Start with markdown lecture notes.</span></button>
        <button onClick={addIdea}><Lightbulb size={22} /><strong>Add an idea</strong><span>Capture essays, projects, and research angles.</span></button>
        <button onClick={addFiles}><FilePlus size={22} /><strong>Import PDFs</strong><span>Add readings, slides, and text files.</span></button>
        <button onClick={loadSampleLibrary}><BookOpen size={22} /><strong>Load sample library</strong><span>Try Commonplace with demo material.</span></button>
      </section>
    </div>;
  }
  return <div className="page"><PageTitle title="Dashboard" subtitle="Your study materials at a glance." />
    <div className="stats">
      <Stat label="Notes" value={data.notes.length} /><Stat label="Ideas" value={data.ideas.length} /><Stat label="Files" value={data.files.length} />
    </div>
    <section className="card"><h2>Continue where you left off</h2><div className="list">
      {recent.length === 0 && <p className="muted">No material yet. Add a note, idea, or PDF to begin.</p>}
      {recent.map(item => <button className="row" key={`${item.kind}-${item.id}`} onClick={() => { setActive(item.kind === 'file' ? 'library' : `${item.kind}s`); setSelected(item.id); }}><strong>{item.title}</strong><span>{item.kind}</span></button>)}
    </div></section>
  </div>;
}
function Stat({ label, value }) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div>; }
function PageTitle({ title, subtitle }) { return <div className="page-title"><h2>{title}</h2><p>{subtitle}</p></div>; }

function Library({ data, persist, addFiles, selected, setSelected }) {
  const item = data.files.find((file) => file.id === selected) || data.files[0];
  const [pdfUrl, setPdfUrl] = useState(null);
  const [page, setPage] = useState(item?.lastPage || 1);
  useEffect(() => {
    setPage(item?.lastPage || 1);
    setPdfUrl(null);
    if (item?.type === 'pdf' && item.storedPath) api.previewFile(item.storedPath).then(setPdfUrl);
  }, [item?.id]);
  const update = async (next) => persist({ ...data, files: data.files.map((file) => file.id === next.id ? touch(next) : file) });
  const remove = async (id) => { await persist({ ...data, files: data.files.filter((file) => file.id !== id) }); setSelected(null); };
  const goPage = (nextPage) => {
    const safe = Math.max(1, Number(nextPage) || 1);
    setPage(safe);
    if (item) update({ ...item, lastPage: safe });
  };
  const addPageBookmark = () => item && update(addBookmark(item, page));
  const removePageBookmark = (bookmarkId) => item && update(removeBookmark(item, bookmarkId));
  return <SplitPage title="Library" subtitle="PDFs, markdown files, and imported notes." items={data.files} selected={item?.id} setSelected={setSelected} emptyAction={addFiles} emptyLabel="Add PDFs or notes">
    {!item ? <Empty text="No files imported yet." /> : <section className="editor card">
      <input className="title-input" value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
      <MetaEditor item={item} update={update} />
      <textarea value={item.description || ''} placeholder="Description or study context…" onChange={(e) => update({ ...item, description: e.target.value })} />
      <div className="actions"><button onClick={() => api.openFile(item.storedPath)}>Open externally</button><button className="danger" onClick={() => remove(item.id)}><Trash2 size={16} /> Remove</button></div>
      {item.type === 'pdf' && <div className="pdf-panel">
        <div className="pdf-toolbar"><button onClick={() => goPage(page - 1)}>Previous</button><input type="number" min="1" value={page} onChange={(e) => goPage(e.target.value)} /><button onClick={() => goPage(page + 1)}>Next</button><button onClick={addPageBookmark}><Bookmark size={16} /> Bookmark page</button></div>
        {pdfUrl ? <iframe className="pdf-frame" title={item.title} src={`${pdfUrl}#page=${page}&toolbar=1`} /> : <p className="muted">PDF preview unavailable for this placeholder.</p>}
        <div className="bookmark-list"><strong>Bookmarks</strong>{(item.bookmarks || []).length === 0 && <span className="muted">No bookmarks yet.</span>}{(item.bookmarks || []).map((bookmark) => <button key={bookmark.id} onClick={() => goPage(bookmark.page)}>{bookmark.label}<span>Page {bookmark.page}</span><Trash2 size={14} onClick={(event) => { event.stopPropagation(); removePageBookmark(bookmark.id); }} /></button>)}</div>
      </div>}
      <h3>Extracted/searchable text</h3><pre className="preview-text">{item.searchableText || 'No extracted text. Filename, tags and description are still searchable.'}</pre>
    </section>}
  </SplitPage>;
}

function Notes({ data, persist, selected, setSelected, addNote }) {
  const note = data.notes.find((x) => x.id === selected) || data.notes[0];
  const update = async (next) => persist({ ...data, notes: data.notes.map((x) => x.id === next.id ? touch(next) : x) });
  const remove = async (id) => { await persist({ ...data, notes: data.notes.filter((x) => x.id !== id) }); setSelected(null); };
  return <SplitPage title="Notes" subtitle="Markdown study notes with live preview." items={data.notes} selected={note?.id} setSelected={setSelected} emptyAction={addNote} emptyLabel="New note">
    {!note ? <Empty text="No notes yet." /> : <MarkdownEditor item={note} update={update} remove={remove} bodyLabel="Note body" />}
  </SplitPage>;
}

function Ideas({ data, persist, selected, setSelected, addIdea }) {
  const idea = data.ideas.find((x) => x.id === selected) || data.ideas[0];
  const update = async (next) => persist({ ...data, ideas: data.ideas.map((x) => x.id === next.id ? touch(next) : x) });
  const remove = async (id) => { await persist({ ...data, ideas: data.ideas.filter((x) => x.id !== id) }); setSelected(null); };
  return <SplitPage title="Ideas" subtitle="Develop raw thoughts into structured academic ideas." items={data.ideas} selected={idea?.id} setSelected={setSelected} emptyAction={addIdea} emptyLabel="New idea">
    {!idea ? <Empty text="No ideas yet." /> : <MarkdownEditor item={idea} update={update} remove={remove} bodyLabel="Idea detail" isIdea />}
  </SplitPage>;
}

function SplitPage({ title, subtitle, items, selected, setSelected, children, emptyAction, emptyLabel }) {
  return <div className="page split-wrap"><PageTitle title={title} subtitle={subtitle} />
    <div className="split"><aside className="item-list"><button className="primary full" onClick={emptyAction}><Plus size={16} /> {emptyLabel}</button>{items.map(item => <button key={item.id} className={selected === item.id ? 'selected row' : 'row'} onClick={() => setSelected(item.id)}><strong>{item.title}</strong><span>{(item.tags || []).join(', ') || item.module || 'untagged'}</span></button>)}</aside>{children}</div>
  </div>;
}

function MarkdownEditor({ item, update, remove, bodyLabel, isIdea }) {
  const exportMarkdown = async () => {
    await api.exportMarkdown({ title: markdownFileName(item.title), content: exportItemToMarkdown(item, isIdea ? 'idea' : 'note') });
  };
  return <section className="editor card">
    <input className="title-input" value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} />
    {isIdea && <><input value={item.summary || ''} placeholder="One-line summary" onChange={(e) => update({ ...item, summary: e.target.value })} /><select value={item.status} onChange={(e) => update({ ...item, status: e.target.value })}><option>Raw</option><option>Developing</option><option>Useful</option><option>Archived</option></select></>}
    <MetaEditor item={item} update={update} />
    <div className="markdown-grid"><label><span>{bodyLabel}</span><textarea value={item.body} onChange={(e) => update({ ...item, body: e.target.value })} /></label><div className="markdown-preview"><ReactMarkdown>{item.body}</ReactMarkdown></div></div>
    <div className="actions"><button><Save size={16} /> Auto-saved</button><button onClick={exportMarkdown}><Download size={16} /> Export .md</button><button className="danger" onClick={() => remove(item.id)}><Trash2 size={16} /> Delete</button></div>
  </section>;
}

function MetaEditor({ item, update }) {
  return <div className="meta-grid"><input value={item.module || ''} placeholder="Module / class" onChange={(e) => update({ ...item, module: e.target.value })} /><input value={formatTags(item.tags)} placeholder="Tags, comma separated" onChange={(e) => update({ ...item, tags: parseTags(e.target.value) })} /><input className="topic-input" value={formatTags(item.topics || [])} placeholder="Graph topics: #finance, #branding, #exam" onChange={(e) => update({ ...item, topics: parseTags(e.target.value).map((topic) => topic.replace(/^#/, '').toLowerCase()) })} /></div>;
}

function SearchView({ results, filter, setFilter, openResult }) {
  return <div className="page"><PageTitle title="Search" subtitle={`${results.length} result${results.length === 1 ? '' : 's'} found.`} />
    <div className="chips">{['all', 'notes', 'ideas', 'files'].map(x => <button key={x} className={filter === x ? 'chip active-chip' : 'chip'} onClick={() => setFilter(x)}>{x}</button>)}</div>
    <section className="card"><div className="list">{results.map(result => <button className="row result" key={`${result.type}-${result.id}`} onClick={() => openResult(result)}><strong>{result.title}</strong><p>{result.excerpt}</p><span>{result.type}</span></button>)}{results.length === 0 && <p className="muted">No matches yet.</p>}</div></section>
  </div>;
}

function TopicGraph({ data, setActive, setSelected }) {
  const [graphQuery, setGraphQuery] = useState('');
  const [kinds, setKinds] = useState(['note', 'idea', 'file']);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const fullGraph = useMemo(() => buildTopicGraph(data), [data]);
  const graph = useMemo(() => filterTopicGraph(fullGraph, { query: graphQuery, kinds }), [fullGraph, graphQuery, kinds]);
  const viewWidth = 860 / zoom;
  const viewHeight = 520 / zoom;
  const toggleKind = (kind) => setKinds((current) => current.includes(kind) ? current.filter((x) => x !== kind) : [...current, kind]);
  const openNode = (node) => {
    if (node.kind === 'topic') return;
    setSelected(node.itemId);
    setActive(node.kind === 'file' ? 'library' : `${node.kind}s`);
  };
  return <div className="page"><PageTitle title="Topic Graph" subtitle="Filter, zoom, and pan your #topic space." />
    <section className="card graph-controls"><input value={graphQuery} onChange={(e) => setGraphQuery(e.target.value)} placeholder="Search topics or nodes…" />{['note', 'idea', 'file'].map((kind) => <button key={kind} className={kinds.includes(kind) ? 'active-chip' : ''} onClick={() => toggleKind(kind)}>{kind}</button>)}<button onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}><ZoomIn size={16} /></button><button onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}><ZoomOut size={16} /></button><button onClick={() => setPan({ x: pan.x - 60, y: pan.y })}>←</button><button onClick={() => setPan({ x: pan.x + 60, y: pan.y })}>→</button><button onClick={() => setPan({ x: pan.x, y: pan.y - 45 })}>↑</button><button onClick={() => setPan({ x: pan.x, y: pan.y + 45 })}>↓</button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setGraphQuery(''); }}><RotateCcw size={16} /></button></section>
    <section className="card graph-card">
      {graph.nodes.length === 0 ? <div className="empty"><p>Add graph topics like <strong>#finance</strong> or <strong>#branding</strong> to a note, idea, or file to build the graph.</p></div> : <div className="graph-space">
        <svg viewBox={`${-viewWidth / 2 + pan.x} ${-viewHeight / 2 + pan.y} ${viewWidth} ${viewHeight}`} role="img" aria-label="3D topic graph">
          <defs>
            <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#17324d" floodOpacity="0.20" /></filter>
          </defs>
          {graph.links.map((link, index) => {
            const source = graph.nodes.find((node) => node.id === link.source);
            const target = graph.nodes.find((node) => node.id === link.target);
            if (!source || !target) return null;
            return <line key={`${link.source}-${link.target}-${index}`} x1={source.x} y1={source.y - source.z * 0.25} x2={target.x} y2={target.y - target.z * 0.25} className="graph-line" />;
          })}
          {[...graph.nodes].sort((a, b) => a.z - b.z).map((node) => {
            const y = node.y - node.z * 0.25;
            return <g key={node.id} className={`graph-node ${node.kind}`} transform={`translate(${node.x} ${y})`} onClick={() => openNode(node)}>
              <circle r={node.size / 2} filter="url(#softShadow)" />
              <text y={node.kind === 'topic' ? 4 : 34} textAnchor="middle">{node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}</text>
              {node.kind === 'topic' && <text y={-node.size / 2 - 8} textAnchor="middle" className="count">{node.count}</text>}
            </g>;
          })}
        </svg>
      </div>}
    </section>
    <section className="card"><h2>How connections work</h2><p className="muted">A note, idea, or file becomes connected when it shares the same graph topic with another item. Use the “Graph topics” field when editing material, or type hashtags directly in note/idea text.</p></section>
  </div>;
}

function SettingsView({ libraryPath, chooseLibrary, openLibrary, createBackup, restoreBackup, status, theme, toggleTheme }) {
  const cloud = cloudStatusForPath(libraryPath);
  return <div className="page"><PageTitle title="Settings" subtitle="Local-first storage. Cloud sync is handled by choosing a synced folder from your desktop cloud provider." />
    <section className="card settings-card"><h2>Appearance</h2><p className="muted">Switch between the stripped-back light workspace and dark mode.</p><div className="actions"><button onClick={toggleTheme}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'Use light mode' : 'Use dark mode'}</button></div></section>
    <section className="card settings-card"><h2>Library location</h2><code>{libraryPath}</code><div className="actions"><button onClick={chooseLibrary}>Change location</button><button onClick={openLibrary}>Open folder</button></div><p className="muted">Status: {status}</p></section>
    <section className="card settings-card"><h2>Backup & restore</h2><p className="muted">Create a manual JSON backup in your library backup folder, or restore from a previous Commonplace backup.</p><div className="actions"><button onClick={createBackup}><Download size={16} /> Create backup</button><button onClick={restoreBackup}><Upload size={16} /> Restore backup</button></div></section>
    <section className="card settings-card cloud-card"><h2><Cloud size={18} /> Cloud option</h2><div className={cloud.synced ? 'cloud-pill synced' : 'cloud-pill'}>{cloud.provider}</div><p>{cloud.message}</p><div className="provider-grid">{cloudProviderOptions.map((option) => <div key={option.name} className={option.name === cloud.provider ? 'provider active-provider' : 'provider'}><strong>{option.name}</strong><span>{option.hint}</span></div>)}</div><p className="muted">Commonplace does not run its own cloud server. It integrates with cloud by storing the selected library folder inside a provider’s desktop sync folder, which keeps the app offline-first and portable.</p></section>
  </div>;
}

function Empty({ text }) { return <section className="card empty"><p>{text}</p></section>; }

createRoot(document.getElementById('root')).render(<App />);
