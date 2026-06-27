import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  FolderOpen,
  Save,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import Modal from '../components/Modal';
import { toast } from 'sonner';
import { useCreateQuery } from '../components/hooks/useCreateQuery';
import { useFetchQuery } from '../components/hooks/useFetchQuery';
import Loader from '../components/loader/Loader';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'checkbox', label: 'Checkbox (multi)' },
];

const emptyQuestion = (type) => ({
  id: crypto.randomUUID(),
  type,
  text: '',
  options:
    type === 'multiple_choice' || type === 'checkbox'
      ? ['Option 1', 'Option 2']
      : [],
});

// Inline editable text
const InlineEdit = ({ value, onChange, placeholder, testId, className }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) {
    return (
      <div className='flex items-center gap-2 flex-1'>
        <input
          autoFocus
          className='input-base !p-2 !text-base'
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          data-testid={`${testId}-input`}
        />
        <button
          className='text-success p-1 hover:bg-success/10 rounded-sm'
          onClick={() => {
            onChange(draft);
            setEditing(false);
          }}
          data-testid={`${testId}-save`}
        >
          <Check size={16} />
        </button>
        <button
          className='text-muted p-1 hover:bg-subtle rounded-sm'
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
          data-testid={`${testId}-cancel`}
        >
          <X size={16} />
        </button>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 flex-1 ${className || ''}`}>
      <span className={!value ? 'text-muted italic' : ''}>
        {value || placeholder}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDraft(value);
          setEditing(true);
        }}
        className='text-muted hover:text-accent p-1'
        data-testid={`${testId}-edit`}
      >
        <Pencil size={14} />
      </button>
    </div>
  );
};

// Question Editor
const QuestionEditor = ({ q, onChange, onDelete, idx }) => {
  const updateOption = (i, val) => {
    const next = [...q.options];
    next[i] = val;
    onChange({ ...q, options: next });
  };
  const addOption = () =>
    onChange({
      ...q,
      options: [...q.options, `Option ${q.options.length + 1}`],
    });
  const removeOption = (i) =>
    onChange({ ...q, options: q.options.filter((_, j) => j !== i) });

  const typeLabel =
    QUESTION_TYPES.find((t) => t.value === q.type)?.label || q.type;

  return (
    <div
      className='bg-surface border border-subtle rounded-sm p-4 mt-3 hover:border-ink transition-colors'
      data-testid={`question-${idx}`}
    >
      <div className='flex justify-between items-start gap-3 mb-3'>
        <div className='flex-1'>
          <div className='label-tiny mb-2'>
            Q{idx + 1} · {typeLabel}
          </div>
          <textarea
            className='input-base !p-2 text-base'
            rows={2}
            placeholder='Enter question text…'
            value={q.text}
            onChange={(e) => onChange({ ...q, text: e.target.value })}
            data-testid={`question-${idx}-text`}
          />
        </div>
        <button
          className='btn-danger'
          onClick={onDelete}
          data-testid={`question-${idx}-delete`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
        <div className='ml-2 pl-4 border-l-2 border-subtle'>
          <div className='label-tiny mb-2'>Options</div>
          {q.options.map((opt, i) => (
            <div key={i} className='flex items-center gap-2 mb-2'>
              <span className='font-mono text-xs text-muted w-6'>
                {String.fromCharCode(65 + i)}.
              </span>
              <input
                className='input-base !p-2 text-sm'
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                data-testid={`question-${idx}-option-${i}`}
              />
              {q.options.length > 1 && (
                <button
                  className='btn-danger'
                  onClick={() => removeOption(i)}
                  data-testid={`question-${idx}-option-${i}-delete`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            className='text-sm font-bold text-accent hover:text-accentHover mt-1'
            onClick={addOption}
            data-testid={`question-${idx}-add-option`}
          >
            + Add option
          </button>
        </div>
      )}

      {q.type === 'rating' && (
        <div className='text-sm text-muted font-mono'>
          Respondents will rate 1 – 5
        </div>
      )}
      {q.type === 'yes_no' && (
        <div className='text-sm text-muted font-mono'>
          Respondents pick Yes / No
        </div>
      )}
      {(q.type === 'short_text' || q.type === 'long_text') && (
        <div className='text-sm text-muted font-mono'>
          Free-form {q.type === 'short_text' ? 'single-line' : 'multi-line'}{' '}
          text
        </div>
      )}
    </div>
  );
};

// Question Settings Modal
const SettingsModal = ({ open, onClose, onApply }) => {
  const [config, setConfig] = useState(
    QUESTION_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: 0 }), {})
  );

  const total = Object.values(config).reduce((s, n) => s + Number(n || 0), 0);

  const apply = () => {
    if (total === 0) {
      toast.error('Add at least one question');
      return;
    }
    const questions = [];
    Object.entries(config).forEach(([type, count]) => {
      for (let i = 0; i < Number(count); i++)
        questions.push(emptyQuestion(type));
    });
    onApply(questions);
    setConfig(
      QUESTION_TYPES.reduce((acc, t) => ({ ...acc, [t.value]: 0 }), {})
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Question Settings'
      testId='settings-modal'
    >
      <p className='text-sm text-muted mb-6'>
        Define question types and how many of each to add to this factor.
      </p>
      <div className='space-y-3 mb-6'>
        {QUESTION_TYPES.map((t) => (
          <div
            key={t.value}
            className='flex items-center justify-between gap-4 p-3 border border-subtle rounded-sm hover:border-ink transition-colors'
          >
            <div className='font-head font-bold text-ink'>{t.label}</div>
            <input
              type='number'
              min={0}
              max={20}
              className='input-base !w-20 text-center font-mono'
              value={config[t.value]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [t.value]: Math.max(
                    0,
                    Math.min(20, parseInt(e.target.value || '0', 10))
                  ),
                })
              }
              data-testid={`settings-count-${t.value}`}
            />
          </div>
        ))}
      </div>
      <div className='flex items-center justify-between border-t border-subtle pt-4'>
        <div className='font-mono text-sm text-muted'>
          TOTAL: <span className='text-ink font-bold'>{total}</span> questions
        </div>
        <div className='flex gap-3'>
          <button
            className='btn-ghost'
            onClick={onClose}
            data-testid='settings-cancel-btn'
          >
            Cancel
          </button>
          <button
            className='btn-primary'
            onClick={apply}
            data-testid='settings-apply-btn'
          >
            Add questions
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Load Categories Modal
const LoadCategoriesModal = ({
  open,
  onClose,
  onSelect,
  existingNames,
  categoriesLib = [],
}) => {
  const [selected, setSelected] = useState({});

  const toggle = (id) => setSelected({ ...selected, [id]: !selected[id] });

  const apply = () => {
    const picks = categoriesLib.filter((c) => selected[c._id]);
    if (!picks.length) {
      toast.error('Select at least one category');
      return;
    }
    onSelect(picks);
    setSelected({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title='Load Categories'
      testId='load-categories-modal'
    >
      {categoriesLib.length === 0 ? (
        <div className='text-muted text-sm text-center py-8 border-2 border-dashed border-subtle rounded-sm'>
          No saved categories yet. Build & save an assessment first.
        </div>
      ) : (
        <>
          <p className='text-sm text-muted mb-4'>
            Selected categories will be appended to your current builder.
          </p>
          <div className='space-y-2 mb-6 max-h-72 overflow-y-auto'>
            {categoriesLib.map((c) => {
              const dup = existingNames.includes(c.name.trim().toLowerCase());
              return (
                <label
                  key={c._id}
                  className={`flex items-center justify-between gap-3 p-3 border-2 rounded-sm cursor-pointer transition-colors ${
                    selected[c._id]
                      ? 'border-ink bg-cream'
                      : 'border-subtle hover:border-ink'
                  }`}
                  data-testid={`load-category-${c.id || c._id}`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={!!selected[c._id]}
                      onChange={() => toggle(c._id)}
                      className='w-4 h-4 accent-accent'
                    />
                    <div>
                      <div className='font-head font-bold text-ink'>
                        {c.name}
                      </div>
                      <div className='font-mono text-xs text-muted'>
                        {c.factors?.length || 0} factor(s) ·{' '}
                        {c.factors?.reduce(
                          (s, f) => s + (f.questions?.length || 0),
                          0
                        ) || 0}{' '}
                        questions
                      </div>
                    </div>
                  </div>
                  {dup && (
                    <span className='font-mono text-[10px] text-accent uppercase tracking-widest'>
                      Duplicate
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          <div className='flex justify-end gap-3 border-t border-subtle pt-4'>
            <button
              className='btn-ghost'
              onClick={onClose}
              data-testid='load-categories-cancel-btn'
            >
              Cancel
            </button>
            <button
              className='btn-primary'
              onClick={apply}
              data-testid='load-categories-apply-btn'
            >
              Load selected
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

const Builder = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]); // {id, name, expanded, factors:[{id,name,expanded,questions:[]}]}
  const [settingsTarget, setSettingsTarget] = useState(null); // {catId, facId}
  const [loadOpen, setLoadOpen] = useState(false);

  const assessmentMutation = useCreateQuery({
    url: '/assessments',
    queryKey: ['assessments'],
    successMessage: 'Assessment saved successfully',
  });

  const { data: categoriesData, isLoading } = useFetchQuery({
    url: '/categories',
    queryKey: ['categories'],
  });

  const updateCategory = (id, patch) =>
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  const removeCategory = (id) =>
    setCategories(categories.filter((c) => c.id !== id));

  const addCategory = () => {
    setCategories([
      ...categories,
      { id: crypto.randomUUID(), name: '', expanded: true, factors: [] },
    ]);
  };

  const updateFactor = (catId, facId, patch) =>
    updateCategory(catId, {
      factors: categories
        .find((c) => c.id === catId)
        .factors.map((f) => (f.id === facId ? { ...f, ...patch } : f)),
    });

  const addFactor = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    updateCategory(catId, {
      factors: [
        ...cat.factors,
        { id: crypto.randomUUID(), name: '', expanded: true, questions: [] },
      ],
    });
  };

  const removeFactor = (catId, facId) => {
    const cat = categories.find((c) => c.id === catId);
    updateCategory(catId, {
      factors: cat.factors.filter((f) => f.id !== facId),
    });
  };

  const onApplyQuestionsToFactor = (questions) => {
    if (!settingsTarget) return;
    const { catId, facId } = settingsTarget;
    const cat = categories.find((c) => c.id === catId);
    const fac = cat.factors.find((f) => f.id === facId);
    updateFactor(catId, facId, { questions: [...fac.questions, ...questions] });
    toast.success(`Added ${questions.length} question(s)`);
  };

  const updateQuestion = (catId, facId, qid, patch) => {
    const cat = categories.find((c) => c.id === catId);
    const fac = cat.factors.find((f) => f.id === facId);
    updateFactor(catId, facId, {
      questions: fac.questions.map((q) => (q.id === qid ? { ...patch } : q)),
    });
  };
  const removeQuestion = (catId, facId, qid) => {
    const cat = categories.find((c) => c.id === catId);
    const fac = cat.factors.find((f) => f.id === facId);
    updateFactor(catId, facId, {
      questions: fac.questions.filter((q) => q.id !== qid),
    });
  };

  const totalQuestions = categories.reduce(
    (s, c) =>
      s + c.factors.reduce((ss, f) => ss + (f.questions?.length || 0), 0),
    0
  );

  const handleSave = async () => {
    if (!title.trim()) return toast.error('Assessment title is required');
    if (categories.length === 0)
      return toast.error('Add at least one category');

    // Notice: We strips the client-side 'id' properties entirely when payloading to the backend
    const cleanCats = categories.map((c) => ({
      name: c.name.trim() || 'Untitled Category',
      factors: c.factors.map((f) => ({
        name: f.name.trim() || 'Untitled Factor',
        questions: f.questions
          .filter((q) => q.text.trim())
          .map((q) => ({
            type: q.type,
            text: q.text.trim(),
            options: q.options,
          })),
      })),
    }));

    const hasQuestion = cleanCats.some((c) =>
      c.factors.some((f) => f.questions.length > 0)
    );
    if (!hasQuestion) return toast.error('Add at least one question with text');

    try {
      await assessmentMutation.mutateAsync({
        title,
        description,
        categories: cleanCats,
      });

      setTitle('');
      setDescription('');
      setCategories([]);

      navigate('/assessments');
    } catch (error) {
      console.error(error);
    }
  };

  const existingNames = categories.map((c) => c.name.trim().toLowerCase());

  if (isLoading) {
    return <Loader fullScreen='' />;
  }
  return (
    <div className='space-y-10'>
      <div>
        <div className='font-mono text-xs tracking-widest text-muted mb-2'>
          BUILDER / NEW ASSESSMENT
        </div>
        <h1 className='font-head font-extrabold text-4xl sm:text-5xl text-ink h-mark mb-2'>
          Build assessment
        </h1>
        <p className='text-muted max-w-2xl'>
          Compose a hierarchical assessment — Categories contain Factors,
          Factors contain Questions. Configure question types via the gear icon.
        </p>
      </div>

      {/* Meta */}
      <div className='card-brut p-6 md:p-8'>
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <label className='label-tiny block mb-2'>Assessment title *</label>
            <input
              className='input-base'
              placeholder='e.g. Engineering Onboarding Q1'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid='builder-title-input'
            />
          </div>
          <div>
            <label className='label-tiny block mb-2'>Description</label>
            <input
              className='input-base'
              placeholder='Short description (optional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid='builder-description-input'
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex flex-wrap gap-3 items-center'>
        <button
          className='btn-secondary flex items-center gap-2'
          onClick={addCategory}
          data-testid='add-category-btn'
        >
          <Plus size={16} /> Add Category
        </button>
        <button
          className='btn-ghost flex items-center gap-2 border border-subtle'
          onClick={() => setLoadOpen(true)}
          data-testid='load-categories-btn'
        >
          <FolderOpen size={16} /> Load Categories
        </button>
        <div className='ml-auto flex items-center gap-4'>
          <div className='font-mono text-xs text-muted'>
            {categories.length} category · {totalQuestions} questions
          </div>
          <button
            className='btn-primary flex items-center gap-2'
            onClick={handleSave}
            disabled={assessmentMutation.isPending}
          >
            <Save size={16} />
            {assessmentMutation.isPending ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      </div>

      {/* Builder accordion */}
      {categories.length === 0 ? (
        <div className='card-std p-12 text-center'>
          <div className='font-mono text-xs tracking-widest text-muted mb-3'>
            EMPTY STATE
          </div>
          <h3 className='font-head font-bold text-2xl text-ink mb-2'>
            Start with a Category
          </h3>
          <p className='text-muted mb-6'>
            Categories group related Factors. Add your first one to begin.
          </p>
          <button
            className='btn-primary'
            onClick={addCategory}
            data-testid='add-category-empty-btn'
          >
            + Add your first category
          </button>
        </div>
      ) : (
        <div className='space-y-6'>
          {categories.map((cat, ci) => (
            <div
              key={cat.id}
              className='bg-surface border-2 border-ink rounded-sm'
              data-testid={`category-${ci}`}
            >
              {/* Category header */}
              <div className='flex items-center justify-between p-5 bg-cream border-b-2 border-ink'>
                <div className='flex items-center gap-3 flex-1'>
                  <button
                    onClick={() =>
                      updateCategory(cat.id, { expanded: !cat.expanded })
                    }
                    className='p-1 hover:bg-subtle rounded-sm transition-transform'
                    data-testid={`category-${ci}-toggle`}
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        cat.expanded ? '' : '-rotate-90'
                      }`}
                    />
                  </button>
                  <span className='font-mono text-xs text-muted'>
                    CATEGORY {String(ci + 1).padStart(2, '0')}
                  </span>
                  <InlineEdit
                    value={cat.name}
                    onChange={(v) => updateCategory(cat.id, { name: v })}
                    placeholder='Untitled category — click to edit'
                    testId={`category-${ci}-name`}
                    className='font-head font-bold text-xl text-ink'
                  />
                </div>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className='btn-danger'
                  data-testid={`category-${ci}-delete`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {cat.expanded && (
                <div className='p-6'>
                  {cat.factors.length === 0 ? (
                    <div className='text-muted text-sm italic mb-4'>
                      No factors yet.
                    </div>
                  ) : (
                    cat.factors.map((fac, fi) => (
                      <div
                        key={fac.id}
                        className='ml-2 md:ml-6 border-l-4 border-accent pl-5 my-5'
                        data-testid={`category-${ci}-factor-${fi}`}
                      >
                        <div className='flex items-center gap-3 mb-3'>
                          <button
                            onClick={() =>
                              updateFactor(cat.id, fac.id, {
                                expanded: !fac.expanded,
                              })
                            }
                            className='p-1 hover:bg-subtle rounded-sm'
                            data-testid={`category-${ci}-factor-${fi}-toggle`}
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${
                                fac.expanded ? '' : '-rotate-90'
                              }`}
                            />
                          </button>
                          <span className='font-mono text-xs text-muted'>
                            FACTOR {ci + 1}.{fi + 1}
                          </span>
                          <InlineEdit
                            value={fac.name}
                            onChange={(v) =>
                              updateFactor(cat.id, fac.id, { name: v })
                            }
                            placeholder='Untitled factor — click to edit'
                            testId={`category-${ci}-factor-${fi}-name`}
                            className='font-head font-bold text-lg'
                          />
                          <button
                            onClick={() =>
                              setSettingsTarget({
                                catId: cat.id,
                                facId: fac.id,
                              })
                            }
                            className='btn-ghost flex items-center gap-1 !py-1 !px-2'
                            data-testid={`category-${ci}-factor-${fi}-settings`}
                            title='Configure question types'
                          >
                            <SettingsIcon size={14} /> Settings
                          </button>
                          <button
                            onClick={() => removeFactor(cat.id, fac.id)}
                            className='btn-danger'
                            data-testid={`category-${ci}-factor-${fi}-delete`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {fac.expanded && (
                          <>
                            {fac.questions.length === 0 ? (
                              <div className='text-muted text-sm italic ml-2 mb-2'>
                                No questions. Click{' '}
                                <span className='font-bold text-ink'>
                                  Settings
                                </span>{' '}
                                to add.
                              </div>
                            ) : (
                              fac.questions.map((q, qi) => (
                                <QuestionEditor
                                  key={q.id}
                                  q={q}
                                  idx={qi}
                                  onChange={(nq) =>
                                    updateQuestion(cat.id, fac.id, q.id, nq)
                                  }
                                  onDelete={() =>
                                    removeQuestion(cat.id, fac.id, q.id)
                                  }
                                />
                              ))
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}

                  <button
                    onClick={() => addFactor(cat.id)}
                    className='btn-ghost flex items-center gap-2 border-2 border-dashed border-subtle hover:border-ink mt-2'
                    data-testid={`category-${ci}-add-factor`}
                  >
                    <Plus size={14} /> Add Factor
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            className='btn-secondary flex items-center gap-2'
            onClick={addCategory}
            data-testid='add-another-category-btn'
          >
            <Plus size={16} /> Add another Category
          </button>
        </div>
      )}

      <SettingsModal
        open={!!settingsTarget}
        onClose={() => setSettingsTarget(null)}
        onApply={onApplyQuestionsToFactor}
      />
      <LoadCategoriesModal
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        existingNames={existingNames}
        categoriesLib={categoriesData?.categories || []}
        onSelect={(picks) => {
          const cloned = picks.map((p) => ({
            id: crypto.randomUUID(),
            name: p.name,
            expanded: true,
            factors: (p.factors || []).map((f) => ({
              id: crypto.randomUUID(),
              name: f.name,
              expanded: true,
              questions: (f.questions || []).map((q) => ({
                ...q,
                id: crypto.randomUUID(),
              })),
            })),
          }));
          setCategories([...categories, ...cloned]);
          toast.success(`Loaded ${cloned.length} category(ies)`);
        }}
      />
    </div>
  );
};

export default Builder;
