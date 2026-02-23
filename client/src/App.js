import { useMemo, useState } from 'react';
import './App.css';

const ELEMENT_LIBRARY = [
  { type: 'sidewalk', label: 'Sidewalk', color: '#b9b7b3', defaultWidth: 2.5 },
  { type: 'bike', label: 'Bike lane', color: '#4caf50', defaultWidth: 1.8 },
  { type: 'car', label: 'Car lane', color: '#5c6bc0', defaultWidth: 3.2 },
  { type: 'bus', label: 'Bus lane', color: '#ef6c00', defaultWidth: 3.4 },
  { type: 'parking', label: 'Parking lane', color: '#8d6e63', defaultWidth: 2.4 },
  { type: 'median', label: 'Median / buffer', color: '#ffca28', defaultWidth: 1.6 },
];

const initialElements = [
  { id: crypto.randomUUID(), type: 'sidewalk', label: 'Sidewalk', color: '#b9b7b3', width: 2.5 },
  { id: crypto.randomUUID(), type: 'bike', label: 'Bike lane', color: '#4caf50', width: 1.8 },
  { id: crypto.randomUUID(), type: 'car', label: 'Car lane', color: '#5c6bc0', width: 3.2 },
  { id: crypto.randomUUID(), type: 'car', label: 'Car lane', color: '#5c6bc0', width: 3.2 },
  { id: crypto.randomUUID(), type: 'sidewalk', label: 'Sidewalk', color: '#b9b7b3', width: 2.5 },
];

const TRAFFIC_ICONS = {
  bike: '🚲',
  car: '🚗',
  bus: '🚌',
  parking: '🚙',
  sidewalk: '🚶',
  median: '🌿',
};

function App() {
  const [streetWidthLimit, setStreetWidthLimit] = useState(16);
  const [selectedType, setSelectedType] = useState(ELEMENT_LIBRARY[0].type);
  const [elements, setElements] = useState(initialElements);
  const [draggedId, setDraggedId] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);

  const usedWidth = useMemo(
    () => elements.reduce((sum, lane) => sum + Number(lane.width || 0), 0),
    [elements]
  );

  const widthDifference = Number((streetWidthLimit - usedWidth).toFixed(2));
  const isOverLimit = widthDifference < 0;

  const addElement = () => {
    const found = ELEMENT_LIBRARY.find((item) => item.type === selectedType);
    if (!found) return;

    setElements((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: found.type,
        label: found.label,
        color: found.color,
        width: found.defaultWidth,
      },
    ]);
  };

  const updateElementWidth = (id, value) => {
    const next = Math.max(0, Number(value || 0));
    setElements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, width: next } : item))
    );
  };

  const removeElement = (id) => {
    setElements((prev) => prev.filter((item) => item.id !== id));
  };

  const moveElement = (sourceId, targetId) => {
    if (!sourceId || sourceId === targetId) return;

    setElements((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === sourceId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;

      const reordered = [...prev];
      const [moved] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      return reordered;
    });
  };

  const handleDragStart = (id) => {
    setDraggedId(id);
  };

  const handleDrop = (targetId) => {
    moveElement(draggedId, targetId);
    setDraggedId(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Street Section Builder</h1>
        <p>Build a simple street profile (like Streetmix) with your own widths and elements.</p>
      </header>

      <main className="app-container">
        <section className="panel controls-panel">
          <h2>Street setup</h2>

          <label className="field-label" htmlFor="streetWidthLimit">
            Total street width (meters)
          </label>
          <input
            id="streetWidthLimit"
            type="number"
            min="1"
            step="0.1"
            value={streetWidthLimit}
            onChange={(event) => setStreetWidthLimit(Number(event.target.value || 0))}
          />

          <div className="add-row">
            <div>
              <label className="field-label" htmlFor="elementType">
                Add element
              </label>
              <select
                id="elementType"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                {ELEMENT_LIBRARY.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={addElement}>
              + Add
            </button>
          </div>

          <div className="summary">
            <p>
              Used width: <strong>{usedWidth.toFixed(2)} m</strong>
            </p>
            <p className={isOverLimit ? 'warning' : 'ok'}>
              {isOverLimit
                ? `Over by ${Math.abs(widthDifference).toFixed(2)} m`
                : `${widthDifference.toFixed(2)} m remaining`}
            </p>
          </div>

          <div className="section-header">
            <h3>Elements</h3>
            <button
              type="button"
              className="secondary"
              onClick={() => setSimulationMode((prev) => !prev)}
            >
              {simulationMode ? 'Back to section' : 'Simulate street'}
            </button>
          </div>
          <p className="helper-text">Drag elements to change their left-to-right location in the street.</p>
          <ul className="lane-list">
            {elements.map((item) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(item.id)}
                className={draggedId === item.id ? 'dragging' : ''}
              >
                <span className="chip" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="name">{item.label}</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={item.width}
                  onChange={(event) => updateElementWidth(item.id, event.target.value)}
                  aria-label={`${item.label} width in meters`}
                />
                <button type="button" className="remove" onClick={() => removeElement(item.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel preview-panel">
          <h2>{simulationMode ? 'Street simulation' : 'Street preview'}</h2>
          <div className="street-canvas" role="img" aria-label="Street cross-section preview">
            {elements.map((item) => {
              const percent = usedWidth === 0 ? 0 : (item.width / usedWidth) * 100;
              const speed = item.type === 'bus' ? 7 : item.type === 'bike' ? 16 : item.type === 'car' ? 10 : 0;
              return (
                <div
                  key={item.id}
                  className={`street-segment ${simulationMode ? 'simulation-segment' : ''}`}
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                  title={`${item.label}: ${Number(item.width).toFixed(2)} m`}
                >
                  <span>{item.label}</span>
                  <small>{Number(item.width).toFixed(1)}m</small>
                  {simulationMode && (
                    <div className="traffic-lane" style={{ animationDuration: `${speed}s` }}>
                      <span>{TRAFFIC_ICONS[item.type]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="preview-note">
            {simulationMode
              ? 'Live simulation: vehicles and users move according to the section you built.'
              : 'Tip: adjust widths and drag element rows to instantly update this section view.'}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
