import { useState, useRef } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';

interface DocumentItem {
  id: string;
  type: string;
  status: string;
  fileName: string;
  fileUrl?: string;
  rejectionNote?: string | null;
  createdAt: string;
}

interface Props {
  applicationId: string;
  documents: DocumentItem[];
  isLandlord: boolean;
  onUpdate: () => void;
}

const DOC_TYPES = [
  { key: 'CC', label: t.workflow.documents.cc, required: true },
  { key: 'WORK_CERT', label: t.workflow.documents.workCert, required: true },
  { key: 'OTHER', label: t.workflow.documents.other, required: false },
] as const;

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  PENDING: t.workflow.documents.pending,
  APPROVED: t.workflow.documents.approved,
  REJECTED: t.workflow.documents.rejected,
};

export function DocumentUpload({ applicationId, documents, isLandlord, onUpdate }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentDocType, setCurrentDocType] = useState('');

  const getDocForType = (type: string) => documents.find((d) => d.type === type);

  const handleUpload = async (docType: string, file: File) => {
    setUploading(docType);
    setError('');
    try {
      // Step 1: Get upload URL
      const urlRes = await apiClient.post<{ uploadUrl: string; key: string }>('/documents/upload-url', {
        applicationId,
        documentType: docType,
        contentType: file.type,
        fileName: file.name,
      });

      // Step 2: Upload file
      await fetch(urlRes.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      // Step 3: Create document record
      await apiClient.post('/documents', {
        applicationId,
        type: docType,
        fileKey: urlRes.data.key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      onUpdate();
    } catch {
      setError(t.common.error);
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (docType: string) => {
    setCurrentDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDocType) {
      handleUpload(currentDocType, file);
    }
    e.target.value = '';
  };

  const handleApprove = async (docId: string) => {
    setError('');
    try {
      await apiClient.put(`/documents/${docId}/approve`);
      onUpdate();
    } catch {
      setError(t.common.error);
    }
  };

  const handleReject = async (docId: string) => {
    if (!rejectionNote.trim()) return;
    setError('');
    try {
      await apiClient.put(`/documents/${docId}/reject`, { rejectionNote });
      setRejectingId(null);
      setRejectionNote('');
      onUpdate();
    } catch {
      setError(t.common.error);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm">{error}</div>
      )}

      {DOC_TYPES.map(({ key, label, required }) => {
        const doc = getDocForType(key);
        const canUpload = !isLandlord && (!doc || doc.status === 'REJECTED');

        return (
          <div
            key={key}
            className="bg-white rounded-2xl shadow-md border border-rumi-primary-light/20 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-rumi-text">{label}</h4>
                  {required && <span className="text-xs text-red-400">*</span>}
                </div>

                {doc ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rumi-text/50">📎 {doc.fileName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[doc.status]}`}>
                        {statusLabels[doc.status]}
                      </span>
                    </div>
                    {doc.rejectionNote && (
                      <p className="text-xs text-red-500 mt-1">
                        Motivo: {doc.rejectionNote}
                      </p>
                    )}

                    {/* Landlord actions */}
                    {isLandlord && doc.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApprove(doc.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          {t.workflow.documents.approve}
                        </button>
                        {rejectingId === doc.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={rejectionNote}
                              onChange={(e) => setRejectionNote(e.target.value)}
                              placeholder={t.workflow.documents.rejectionNote}
                              className="px-2 py-1 text-xs border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => handleReject(doc.id)}
                              className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-lg"
                            >
                              {t.common.confirm}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(doc.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            {t.workflow.documents.reject}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-rumi-text/40 mt-1">
                    {isLandlord ? t.workflow.documents.waitingDocs : t.workflow.documents.requiredDocs}
                  </p>
                )}
              </div>

              {/* Upload button for tenant */}
              {canUpload && (
                <button
                  onClick={() => handleFileSelect(key)}
                  disabled={uploading === key}
                  className="px-3 py-2 text-xs font-medium bg-rumi-primary text-white rounded-lg hover:bg-rumi-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {uploading === key ? '...' : doc ? t.workflow.documents.reupload : t.workflow.documents.upload}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
