import { useState, useRef } from 'react';
import { t } from '../../i18n/es';
import apiClient from '../../services/api-client';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../ui/ErrorAlert';
import { IconUpload, IconCheck, IconX, IconDocument } from '../ui/Icons';

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

const statusVariant: Record<string, 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
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
      const urlRes = await apiClient.post<{ uploadUrl: string; key: string }>('/documents/upload-url', {
        applicationId,
        documentType: docType,
        contentType: file.type,
        fileName: file.name,
      });

      await fetch(urlRes.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

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

      <ErrorAlert message={error} />

      {DOC_TYPES.map(({ key, label, required }) => {
        const doc = getDocForType(key);
        const canUpload = !isLandlord && (!doc || doc.status === 'REJECTED');

        return (
          <Card key={key} variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rumi-primary/10 to-rumi-accent/10 flex items-center justify-center">
                    <IconDocument className="w-4 h-4 text-rumi-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-rumi-text">{label}</h4>
                  {required && <span className="text-xs text-rumi-danger">*</span>}
                </div>

                {doc ? (
                  <div className="mt-3 ml-10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rumi-text/50 truncate max-w-[200px]">{doc.fileName}</span>
                      <Badge variant={statusVariant[doc.status] || 'neutral'} size="sm">
                        {statusLabels[doc.status]}
                      </Badge>
                    </div>
                    {doc.rejectionNote && (
                      <p className="text-xs text-rumi-danger mt-1.5">
                        Motivo: {doc.rejectionNote}
                      </p>
                    )}

                    {/* Landlord actions */}
                    {isLandlord && doc.status === 'PENDING' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<IconCheck className="w-3.5 h-3.5" />}
                          onClick={() => handleApprove(doc.id)}
                          className="!bg-green-600 hover:!bg-green-700"
                        >
                          {t.workflow.documents.approve}
                        </Button>
                        {rejectingId === doc.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={rejectionNote}
                              onChange={(e) => setRejectionNote(e.target.value)}
                              placeholder={t.workflow.documents.rejectionNote}
                              className="px-3 py-1.5 text-xs border-2 border-rumi-primary-light/30 rounded-xl focus:outline-none focus:border-rumi-primary focus:ring-4 focus:ring-rumi-primary/10 transition-all"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(doc.id)}
                            >
                              {t.common.confirm}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<IconX className="w-3.5 h-3.5" />}
                            onClick={() => setRejectingId(doc.id)}
                            className="!border-red-300 !text-red-600 hover:!bg-red-50"
                          >
                            {t.workflow.documents.reject}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-rumi-text/40 mt-2 ml-10">
                    {isLandlord ? t.workflow.documents.waitingDocs : t.workflow.documents.requiredDocs}
                  </p>
                )}
              </div>

              {/* Upload button for tenant */}
              {canUpload && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<IconUpload className="w-4 h-4" />}
                  onClick={() => handleFileSelect(key)}
                  loading={uploading === key}
                >
                  {doc ? t.workflow.documents.reupload : t.workflow.documents.upload}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
