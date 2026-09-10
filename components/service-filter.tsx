"use client"

import { normalizeSearch } from "@/lib/acervo-search"
import { servicesForCategory } from "@/lib/supplier-profile"

export function ServiceFilter({ categoryName, selected, declared = [], onChange }: {
  categoryName: string
  selected: string[]
  declared?: string[]
  onChange: (values: string[]) => void
}) {
  const options = new Map<string, string>()
  for (const value of [...servicesForCategory(categoryName), ...declared, ...selected]) {
    const key = normalizeSearch(value)
    if (key && !options.has(key)) options.set(key, value.trim())
  }
  const selectedKeys = new Set(selected.map(normalizeSearch))
  return <fieldset className="min-w-0">
    <legend className="text-sm font-medium text-onix">Serviços da categoria</legend>
    {!categoryName && !selected.length ? <p className="mt-2 text-sm text-onix/60">Selecione um tipo de fornecedor para escolher os serviços.</p> : <>
      <p className="mt-2 text-xs leading-relaxed text-onix/65">Marque um ou mais serviços. Mostraremos fornecedores que ofereçam todos os selecionados.</p>
      <div className="mt-3 grid gap-2">
        {[...options].map(([key, value]) => <label key={key} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-linha bg-white p-3 text-sm focus-within:outline-2 focus-within:outline-bronze">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bronze" checked={selectedKeys.has(key)} onChange={event => onChange(event.target.checked ? [...selected, value] : selected.filter(item => normalizeSearch(item) !== key))} />
          <span>{value}</span>
        </label>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span aria-live="polite">{selectedKeys.size ? `${selectedKeys.size} serviço(s) selecionado(s)` : "Todos os serviços"}</span>
        {selected.length > 0 && <button type="button" onClick={() => onChange([])} className="min-h-11 px-2 underline">Limpar serviços</button>}
      </div>
    </>}
  </fieldset>
}
