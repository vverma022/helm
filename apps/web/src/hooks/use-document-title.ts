import { useEffect } from 'react'

export const HELM_DOCUMENT_TITLE = 'Helm Web'

export function formatDocumentTitle(section?: string | null): string {
  const normalized = section?.trim()
  if (!normalized || normalized === HELM_DOCUMENT_TITLE) return HELM_DOCUMENT_TITLE
  return `${normalized} — ${HELM_DOCUMENT_TITLE}`
}

export function useDocumentTitle(section?: string | null) {
  const title = formatDocumentTitle(section)
  useEffect(() => {
    document.title = title
  }, [title])
}
