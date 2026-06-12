import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, BookOpen, GraduationCap, AlertCircle, Loader } from 'lucide-react';

const EnrollmentCertificate = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. CAPTURAR EL CUI DESDE LA URL DEL NAVEGADOR (?cui=XXXXXXXX)
  const queryParams = new URLSearchParams(window.location.search);
  // Si no hay CUI en la URL, usamos '20250102' como respaldo (fallback)
  const cuiParam = queryParams.get('cui') || '20250102'; 

  // 2. CONSTRUIR LA URL DE LA API DINÁMICAMENTE
  const API_URL = `https://sisacad-enrollments-backend.vercel.app/restful/enrollment-certificate/?cui=${cuiParam}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        
        if (response.data && response.data.results) {
          setRawData(response.data.results);
        } else {
          setRawData([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error al consumir la API:", err);
        setError("No se pudo conectar con el servidor o el CUI especificado no existe.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]); // Se vuelve a ejecutar si cambia la API_URL

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <Loader style={styles.spinner} />
        <p>Cargando Constancia de Matrícula para el CUI: {cuiParam}...</p>
      </div>
    );
  }

  if (error || rawData.length === 0) {
    return (
      <div style={styles.centerContainer}>
        <AlertCircle style={{ color: '#dc2626' }} size={48} />
        <p style={{ color: '#dc2626', fontWeight: 'bold' }}>
          {error || `No se encontraron registros de matrícula para el CUI: ${cuiParam}`}
        </p>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Asegúrate de pasar un parámetro válido en la URL. Ej: ?cui=20250102
        </p>
      </div>
    );
  }

  const estudiante = rawData[0]?.student;
  const fechaRegistro = rawData[0]?.created ? new Date(rawData[0].created).toLocaleDateString() : 'Reciente';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <GraduationCap size={40} color="#fff" />
        <div>
          <h1 style={styles.title}>SISACAD - CONSTANCIA DE MATRÍCULA</h1>
          <p style={styles.subtitle}>Fecha de Emisión: {fechaRegistro}</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <User size={20} style={{ marginRight: 8 }} /> Datos del Estudiante
        </h2>
        <div style={styles.grid}>
          <p><strong>Nombre Completo:</strong> {estudiante?.full_name || 'No provisto'}</p>
          <p><strong>CUI (Código):</strong> {estudiante?.cui || 'No provisto'}</p>
          <p><strong>Email Institucional:</strong> {estudiante?.email || 'No registrado'}</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <BookOpen size={20} style={{ marginRight: 8 }} /> Asignaturas Registradas
        </h2>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Código</th>
              <th style={styles.th}>Asignatura</th>
              <th style={styles.th}>Créditos</th>
              <th style={styles.th}>Grupo</th>
              <th style={styles.th}>Docente</th>
            </tr>
          </thead>
          <tbody>
            {rawData.map((item, index) => {
              const curso = item?.workload?.course;
              const profesor = item?.workload?.teacher;
              const grupo = item?.workload?.group;

              return (
                <tr key={item.id || index} style={index % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>{curso?.code || '-'}</td>
                  <td style={styles.td}>
                    <div><strong>{curso?.name || 'Sin nombre'}</strong></div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {curso?.year_display} - {curso?.semester_display}
                    </div>
                  </td>
                  <td style={styles.td}>{curso?.credits || '-'}</td>
                  <td style={styles.td}>{grupo || '-'}</td>
                  <td style={styles.td}>{profesor?.full_name || 'Por asignar'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.footer}>
        <p>Documento oficial generado digitalmente mediante API REST Framework (ReadOnly)</p>
      </div>
    </div>
  );
};

const styles = {
  card: { maxWidth: '850px', margin: '30px auto', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '12px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#1e3a8a', color: '#fff', padding: '20px', borderRadius: '8px 8px 0 0' },
  title: { margin: 0, fontSize: '22px', letterSpacing: '0.5px' },
  subtitle: { margin: '5px 0 0 0', opacity: 0.9 },
  section: { marginTop: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb', color: 'black'},
  sectionTitle: { display: 'flex', alignItems: 'center', color: '#1e3a8a', fontSize: '18px', margin: '0 0 15px 0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  thRow: { backgroundColor: '#f3f4f6' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #d1d5db', color: '#374151', fontWeight: 'bold', fontSize: '14px' },
  td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '14px' },
  trEven: { backgroundColor: '#f9fafb' },
  centerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '10px', fontFamily: 'Arial' },
  spinner: { width: '40px', height: '40px', color: '#1e3a8a' },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }
};

export default EnrollmentCertificate;
