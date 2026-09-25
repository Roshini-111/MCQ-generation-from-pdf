import { useEffect, useState, useRef } from 'react'
import { BookOpen, Upload, Trash2, FileText, Tag, Calendar, CircleAlert as AlertCircle } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, AIProcessing, ErrorState } from '../components/States'
import { getMaterials, uploadMaterial, deleteMaterial } from '../services/api'
import type { Material } from '../types'

export function Materials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMaterials().then((data) => {
      setMaterials(data)
      setLoading(false)
    })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const newMaterial = await uploadMaterial(file, subject)
      setMaterials((prev) => [newMaterial, ...prev])
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.message ?? 'Failed to upload file. Please try again.'
      setError(String(detail))
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    await deleteMaterial(id)
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  if (uploading) return <AIProcessing message="Extracting text and analyzing course concepts..." />

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My Materials"
        subtitle="Upload textbooks, slide decks, and study notes for automated MCQ generation"
      />

      {/* Upload area */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="label">Subject Tag (optional)</label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Computer Networks, Biology, Economics"
            />
          </div>
          <div className="w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer w-full sm:w-auto shadow-md">
              <Upload className="h-4 w-4 text-[#DDA15E]" />
              Upload PDF
            </label>
          </div>
        </div>
        <div className="mt-3.5 flex items-start gap-2 text-xs text-[#606C38]">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#BC6C25]" />
          <p>Supported formats: PDF, PNG, JPG. AI automatically analyzes and extracts topics and key definitions.</p>
        </div>
      </div>

      {error && <div className="card border-[#BC6C25]/40 bg-[#BC6C25]/10"><ErrorState message={error} /></div>}

      {/* Materials list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="h-5 w-3/4 shimmer rounded mb-3" />
              <div className="h-4 w-1/2 shimmer rounded" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="No materials uploaded yet"
            description="Upload your first textbook or lecture PDF to start generating AI-powered questions."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((material) => (
            <div key={material.id} className="card hover:shadow-md transition group border-[#E8E2C8] hover:border-[#DDA15E]">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 bg-[#606C38]/15 border border-[#606C38]/30 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-[#606C38]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#283618] text-base truncate">{material.fileName}</h3>
                  <p className="text-xs text-[#BC6C25] font-semibold mt-0.5">{material.subject || 'General'}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#8C8F7A] font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-[#DDA15E]" />
                      {material.fileSize}
                    </span>
                    <span>{material.pages} pages</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#DDA15E]" />
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-[#8C8F7A] hover:text-[#BC6C25] hover:bg-[#FEFAE0] p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Delete material"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E8E2C8] flex flex-wrap gap-1.5">
                {material.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 bg-[#FEFAE0] text-[#283618] border border-[#E8E2C8] rounded-lg text-xs font-semibold"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
