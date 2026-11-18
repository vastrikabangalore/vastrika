import { useEffect, useState } from 'react'
import { LoadState, PageHead, TextField, useFeedback } from '../components/ui'
import { friendlyError, slugify, unwrap, useLoad } from '../lib/helpers'
import { supabase } from '../lib/supabase'

const empty = { id: null, name: '', slug: '', sort_order: '0' }

const loadCategories = () => supabase
  .from('categories')
  .select('id, name, slug, sort_order, designs(count)')
  .order('sort_order')
  .order('name')
  .then(unwrap)

export default function Categories() {
  useEffect(() => { document.title = 'Categories | Vastrika Admin' }, [])
  const { data, loading, error, reload } = useLoad(loadCategories)
  const { notify, confirm } = useFeedback()
  const [form, setForm] = useState(empty)
  const [problem, setProblem] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (event) => {
    event.preventDefault()
    setProblem('')
    const slug = slugify(form.slug || form.name)
    if (!form.name.trim()) return setProblem('Add a name.')
    if (!slug) return setProblem('Add a web address using English letters or numbers.')
    setSaving(true)
    const payload = { name: form.name.trim(), slug, sort_order: Number(form.sort_order) || 0 }
    const { error: saveError } = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload)
    setSaving(false)
    if (saveError) return setProblem(friendlyError(saveError))
    notify(form.id ? 'Category saved' : 'Category added')
    setForm(empty)
    reload()
    return undefined
  }

  const remove = async (category) => {
    const accepted = await confirm({
      title: `Delete ${category.name}?`,
      body: 'Its designs stay in your portfolio without a category.',
      action: 'Delete category',
    })
    if (!accepted) return
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id)
    if (deleteError) {
      notify(friendlyError(deleteError), 'error')
      return
    }
    if (form.id === category.id) setForm(empty)
    notify('Category deleted')
    reload()
  }

  return (
    <>
      <PageHead title="Categories" />
      <div className="edit-grid">
        <div>
          <LoadState loading={loading} error={error} retry={reload} />
          {data?.length === 0 && <p className="panel">Add categories such as Bridal, Sarees or Ready-to-wear.</p>}
          {data?.length > 0 && (
            <ul className="rows">
              {data.map((category) => {
                const total = category.designs[0]?.count ?? 0
                return (
                  <li key={category.id}>
                    <span className="row-main">
                      <span>
                        <strong>{category.name}</strong>
                        <small>{total} {total === 1 ? 'design' : 'designs'}</small>
                      </span>
                    </span>
                    <div className="row-actions">
                      <button
                        onClick={() => {
                          setProblem('')
                          setForm({
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            sort_order: String(category.sort_order),
                          })
                        }}
                        aria-label={`Edit ${category.name}`}
                      >
                        Edit
                      </button>
                      <button className="text-danger" onClick={() => remove(category)} aria-label={`Delete ${category.name}`}>Delete</button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <form className="panel" onSubmit={save} noValidate>
          <h2>{form.id ? 'Edit category' : 'Add category'}</h2>
          <TextField label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField
            label="Web address"
            hint="Created from the name if left empty"
            value={form.slug}
            onChange={(slug) => setForm({ ...form, slug })}
          />
          <TextField
            label="Position"
            hint="Lower numbers appear first"
            type="number"
            value={form.sort_order}
            onChange={(sort_order) => setForm({ ...form, sort_order })}
          />
          {problem && <p className="error" role="alert">{problem}</p>}
          <div className="actions">
            <button className="button primary" disabled={saving}>{form.id ? 'Save category' : 'Add category'}</button>
            {form.id && <button type="button" className="button" onClick={() => setForm(empty)}>Cancel</button>}
          </div>
        </form>
      </div>
    </>
  )
}
