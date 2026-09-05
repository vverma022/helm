import { describe, expect, test } from 'bun:test'
import {
  formatDocumentTitle,
  HELM_DOCUMENT_TITLE,
} from './use-document-title'

describe('formatDocumentTitle', () => {
  test('uses the product title without a section', () => {
    expect(formatDocumentTitle()).toBe(HELM_DOCUMENT_TITLE)
    expect(formatDocumentTitle('   ')).toBe(HELM_DOCUMENT_TITLE)
  })

  test('identifies the current browser surface', () => {
    expect(formatDocumentTitle('New Task')).toBe('New Task — Helm Web')
    expect(formatDocumentTitle('  General  ')).toBe('General — Helm Web')
  })

  test('does not duplicate the product title', () => {
    expect(formatDocumentTitle(HELM_DOCUMENT_TITLE)).toBe(HELM_DOCUMENT_TITLE)
  })
})
