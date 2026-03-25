'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { uploadNotes, getSubjects, getNotes } from '@/services/api';
import { isLoggedIn } from '@/lib/auth';

export default function UploadPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [progress, setProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    getSubjects().then(r => { setSubjects(r.data); if (r.data.length) setSelectedSubject(r.data[0].id); });
  }, []);

  useEffect(() => {
    if (selectedSubject) getNotes(selectedSubject).then(r => setUploadedNotes(r.data)).catch(() => {});
  }, [selectedSubject]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!selectedSubject) { alert('Please select a subject first.'); return; }
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true); setProgress(0); setSuccessMsg('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subject_id', selectedSubject);
    try {
      const res = await uploadNotes(fd);
      setSuccessMsg(`✓ Uploaded! Extracted ${res.data.chunk_count} chunks from "${file.name}"`);
      setProgress(100);
      getNotes(selectedSubject).then(r => setUploadedNotes(r.data));
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.detail || 'Unknown error'));
    } finally { setUploading(false); }
  }, [selectedSubject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1,
  });

  return (
    <div className="shell">
      <div style={{ width: '100%', maxWidth: 860 }}>
        <Navbar />

        <div className="anim-1" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: 'white' }}>Upload Notes</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 4 }}>Upload your PDF notes — AI will extract content and generate quizzes from them</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* Upload panel */}
          <div className="card anim-2" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 18 }}>Select Subject</h3>
            <select className="inp" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ marginBottom: 24 }}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.exam_target})</option>)}
            </select>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 12 }}>Upload PDF</h3>
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--teal)' : 'rgba(42,157,143,0.3)'}`,
              borderRadius: 16, padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(42,157,143,0.05)' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s'
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
              {isDragActive
                ? <p style={{ color: 'var(--teal)', fontWeight: 500 }}>Drop your PDF here</p>
                : <><p style={{ color: 'var(--mid)', fontSize: 14 }}>Drag & drop your PDF notes</p><p style={{ color: 'var(--light)', fontSize: 12, marginTop: 4 }}>or click to browse files</p></>
              }
            </div>

            {uploading && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--mid)', marginBottom: 6 }}>
                  <span>Extracting text...</span><span>{progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              </div>
            )}

            {successMsg && (
              <div style={{ marginTop: 16, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#16a34a' }}>
                {successMsg}
              </div>
            )}
          </div>

          {/* Uploaded notes list */}
          <div className="card anim-3" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: 'var(--dark)', marginBottom: 18 }}>
              Uploaded Notes {uploadedNotes.length > 0 && <span className="tag tag-teal" style={{ marginLeft: 8 }}>{uploadedNotes.length}</span>}
            </h3>
            {uploadedNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--light)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                No notes uploaded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {uploadedNotes.map(n => (
                  <div key={n.id} className="card-white" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📄</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.filename}</div>
                      <div style={{ fontSize: 12, color: 'var(--light)', marginTop: 2 }}>{n.chunk_count} chunks · {new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="tag tag-teal">Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
