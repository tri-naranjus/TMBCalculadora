
import React, { useState } from 'react';
import PlanNutricionalEntreno from './components/PlanNutricionalEntreno';

const actividadFactor = {
  'Sedentario':          [1.1, 1.2, 1.2, 1.3, 1.4, 1.5, 1.5, 1.5],
  'Ligeramente activo':  [1.2, 1.4, 1.4, 1.5, 1.6, 1.7, 1.7, 1.7],
  'Activo':              [1.4, 1.6, 1.6, 1.7, 1.8, 1.9, 1.9, 1.9],
  'Muy activo':          [1.5, 1.8, 1.8, 1.9, 2.0, 2.1, 2.1, 2.1]
};

// g/kg de peso corporal por objetivo
const objetivosMacros = {
  'Pérdida de grasa': { prot: 2.2, grasa: 0.8 },
  'Mantenimiento':    { prot: 1.8, grasa: 1.0 },
  'Recomposición':    { prot: 2.2, grasa: 1.0 },
  'Ganancia muscular':{ prot: 2.0, grasa: 1.1 }
};

// Ajuste calórico sobre el GET (gasto energético total con ETA incluida)
function calcularKcalObjetivo(get, objetivo) {
  switch (objetivo) {
    case 'Pérdida de grasa':
      // déficit de 400-500 kcal, nunca por debajo de 1200 kcal
      return Math.max(Math.round(get - 450), 1200);
    case 'Mantenimiento':
      return Math.round(get);
    case 'Recomposición':
      // mantenimiento: mismas kcal, reparto diferente de macros
      return Math.round(get);
    case 'Ganancia muscular':
      // superávit moderado de 350 kcal
      return Math.round(get + 350);
    default:
      return Math.round(get);
  }
}

export default function CalculadoraTMB() {
  const [sexo, setSexo] = useState('Hombre');
  const [edad, setEdad] = useState(30);
  const [peso, setPeso] = useState(75);
  const [altura, setAltura] = useState(175);
  const [actividad, setActividad] = useState('Ligeramente activo');
  const [diasEntreno, setDiasEntreno] = useState(3);
  const [objetivo, setObjetivo] = useState('Mantenimiento');
  const [resultados, setResultados] = useState(null);

  const calcular = () => {
    const pesoF = parseFloat(peso);
    const alturaF = parseFloat(altura);
    const edadF = parseFloat(edad);

    let hb, owen, mifflin;

    if (sexo === 'Hombre') {
      hb     = 88.36 + (13.4 * pesoF) + (4.8 * alturaF) - (5.7 * edadF);
      owen   = 879 + (10.2 * pesoF);
      mifflin = (10 * pesoF) + (6.25 * alturaF) - (5 * edadF) + 5;
    } else {
      hb     = 447.6 + (9.2 * pesoF) + (3.1 * alturaF) - (4.3 * edadF);
      owen   = 795 + (7.18 * pesoF);
      mifflin = (10 * pesoF) + (6.25 * alturaF) - (5 * edadF) - 161;
    }

    const tmb = (hb + owen + mifflin) / 3;
    const factor = actividadFactor[actividad][diasEntreno];

    // GET = TMB × factor de actividad + 10% ETA (efecto termogénico de los alimentos)
    const tdeeBase = tmb * factor;
    const eta = tdeeBase * 0.10;
    const get = tdeeBase + eta;

    const kcal = calcularKcalObjetivo(get, objetivo);
    const { prot, grasa } = objetivosMacros[objetivo];
    const proteinas = pesoF * prot;
    const grasas = pesoF * grasa;
    const kcalCarbs = kcal - (proteinas * 4) - (grasas * 9);
    const carbohidratos = kcalCarbs / 4;

    setResultados({
      tmb: Math.round(tmb),
      tdeeBase: Math.round(tdeeBase),
      eta: Math.round(eta),
      get: Math.round(get),
      objetivo,
      kcal,
      proteinas: Math.round(proteinas),
      grasas: Math.round(grasas),
      carbohidratos: Math.round(carbohidratos < 0 ? 0 : carbohidratos)
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-2 text-orange-500 text-center">Calculadora TMB & Gasto Energético</h1>
      <h2 className="text-sm text-gray-500 mb-6 text-center italic">Introduce tus datos y ajusta tu objetivo</h2>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="grid gap-4">
          <div>
            <label className="block font-medium mb-1">Sexo:</label>
            <select value={sexo} onChange={e => setSexo(e.target.value)} className="w-full border p-2 rounded">
              <option>Hombre</option>
              <option>Mujer</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Edad:</label>
            <input type="number" value={edad} onChange={e => setEdad(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Peso (kg):</label>
            <input type="number" value={peso} onChange={e => setPeso(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Altura (cm):</label>
            <input type="number" value={altura} onChange={e => setAltura(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium mb-1">Actividad diaria (sin contar entreno):</label>
            <select value={actividad} onChange={e => setActividad(e.target.value)} className="w-full border p-2 rounded">
              <option>Sedentario</option>
              <option>Ligeramente activo</option>
              <option>Activo</option>
              <option>Muy activo</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Días de entrenamiento por semana: <span className="text-orange-600 font-semibold">{diasEntreno} días</span></label>
            <input type="range" min="0" max="7" value={diasEntreno} onChange={e => setDiasEntreno(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block font-medium mb-2">Objetivo:</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(objetivosMacros).map(obj => (
                <button
                  key={obj}
                  type="button"
                  onClick={() => setObjetivo(obj)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    objetivo === obj
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button onClick={calcular} className="bg-orange-500 text-white px-8 py-3 rounded-xl shadow hover:bg-orange-600 transition-all duration-300 font-semibold text-lg">
          Calcular Plan Nutricional
        </button>
      </div>

      {resultados && (
        <>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">TMB (Tasa Metabólica Basal)</p>
              <p className="text-3xl font-bold text-gray-800">{resultados.tmb}</p>
              <p className="text-xs text-gray-400">kcal/día en reposo total</p>
              <p className="text-xs text-gray-400">Media Harris-Benedict + Owen + Mifflin-St Jeor</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-300 shadow-sm">
              <p className="text-sm text-blue-600 mb-1">GET — Gasto Energético Total</p>
              <p className="text-3xl font-bold text-blue-700">{resultados.get}</p>
              <p className="text-xs text-gray-400">TMB × factor actividad + 10% ETA</p>
              <p className="text-xs text-gray-400">Base TDEE: {resultados.tdeeBase} kcal · ETA: +{resultados.eta} kcal</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-400 shadow-sm">
              <p className="text-sm font-semibold text-orange-600 mb-1">Calorías Objetivo</p>
              <p className="text-3xl font-bold text-orange-600">{resultados.kcal}</p>
              <p className="text-xs text-orange-500 font-medium">{resultados.objetivo}</p>
              {resultados.objetivo === 'Pérdida de grasa' && (
                <p className="text-xs text-gray-400">Déficit de {resultados.get - resultados.kcal} kcal sobre el GET</p>
              )}
              {resultados.objetivo === 'Ganancia muscular' && (
                <p className="text-xs text-gray-400">Superávit de {resultados.kcal - resultados.get} kcal sobre el GET</p>
              )}
              {(resultados.objetivo === 'Mantenimiento' || resultados.objetivo === 'Recomposición') && (
                <p className="text-xs text-gray-400">Igual al GET (mantenimiento)</p>
              )}
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl shadow-inner">
            <p className="text-lg font-bold text-orange-600 mb-4">Distribución de Macronutrientes</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-gray-500">Proteínas</p>
                <p className="text-2xl font-bold text-orange-500">{resultados.proteinas}g</p>
                <p className="text-xs text-gray-400">{resultados.proteinas * 4} kcal</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-gray-500">Grasas</p>
                <p className="text-2xl font-bold text-orange-500">{resultados.grasas}g</p>
                <p className="text-xs text-gray-400">{resultados.grasas * 9} kcal</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-gray-500">Carbohidratos</p>
                <p className="text-2xl font-bold text-orange-500">{resultados.carbohidratos}g</p>
                <p className="text-xs text-gray-400">{resultados.carbohidratos * 4} kcal</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <PlanNutricionalEntreno
              GET={resultados.kcal}
              peso={peso}
              edad={edad}
              altura={altura}
              sexo={sexo}
              objetivo={objetivo}
            />
          </div>
        </>
      )}
    </div>
  );
}
