/**
 * articles-data.js — Artículos de interés del portfolio de Gerardo González
 *
 * Estructura de cada artículo:
 *   - id          : string único (slug, sin espacios)
 *   - date        : 'YYYY-MM-DD'
 *   - category    : 'data-science' | 'netsuite' | 'ia' | 'general'
 *   - cover       : ruta de imagen o null
 *   - title       : { es: '…', en: '…' }
 *   - summary     : { es: '…', en: '…' }  — resumen corto para la tarjeta
 *   - readingTime : '5 min' (opcional)
 *   - externalLink: URL string o null — si se define, "Leer →" abre esa URL en lugar del detalle
 *   - tags        : ['tag1', 'tag2']
 *   - sections    : array de secciones libres (igual que projects-data.js)
 *                   cada sección: { title: string, blocks: [ {type:'text'|'image', content, caption?} ] }
 */

var ARTICLES_DATA = [

  {
    id: 'eda-siniestros-montevideo-2022',
    date: '2025-06-10',
    category: 'data-science',
    cover: null,
    title: {
      es: 'Análisis exploratorio de siniestros viales en Montevideo (2022)',
      en: 'Exploratory Analysis of Traffic Accidents in Montevideo (2022)'
    },
    summary: {
      es: 'Los miércoles y tardes concentran el mayor riesgo. Los motociclistas representan el 58 % de los siniestros urbanos. Un análisis con Python sobre datos abiertos de la Intendencia.',
      en: 'Wednesdays and afternoons concentrate the highest risk. Motorcyclists account for 58% of urban accidents. A Python analysis using Montevideo\'s open data.'
    },
    readingTime: '7 min',
    externalLink: null,
    tags: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'EDA'],
    sections: [
      {
        title: 'Contexto',
        blocks: [
          {
            type: 'text',
            content: 'Proyecto desarrollado en el marco de la materia <strong>Fundamentos de Programación para Ciencia de Datos</strong> de la Especialización en Ciencia de Datos e Inteligencia Artificial (UTEC · MIT). El dataset utilizado contiene registros oficiales de la Intendencia de Montevideo correspondientes al año 2022, disponibles como datos abiertos.'
          }
        ]
      },
      {
        title: 'Hallazgos principales',
        blocks: [
          {
            type: 'text',
            content: '<ul><li>Los <strong>miércoles</strong> concentran la mayor cantidad de siniestros por día de la semana.</li><li>Los horarios de <strong>tarde (17–19 h)</strong> registran el mayor volumen de incidentes.</li><li>Los <strong>motociclistas</strong> son el grupo más afectado, representando el <strong>58 %</strong> del total de siniestros urbanos.</li><li>El <strong>Centro y Ciudad Vieja</strong> presentan los puntos de mayor densidad.</li></ul>'
          }
        ]
      },
      {
        title: 'Metodología',
        blocks: [
          {
            type: 'text',
            content: '<ul><li>Carga y limpieza del dataset (valores nulos, tipos de datos, duplicados)</li><li>Análisis univariado y bivariado con Pandas</li><li>Visualizaciones temporales: distribución por hora, día de semana y mes</li><li>Mapa de calor geográfico con Folium</li><li>Segmentación por tipo de vehículo involucrado</li></ul>'
          }
        ]
      }
    ]
  }

];
