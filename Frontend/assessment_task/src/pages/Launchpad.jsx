import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Rocket, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useFetchQuery } from '../components/hooks/useFetchQuery';
import { useCreateQuery } from '../components/hooks/useCreateQuery';

// List view + Take view (when :id is present)
const LaunchPad = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useFetchQuery({
    url: id ? `/assessments/${id}` : '/assessments',
    queryKey: id ? ['assessment', id] : ['assessments'],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (id) {
    const assessment = data?.assessment;

    if (!assessment) {
      return (
        <div className='text-center py-16'>
          <p className='text-muted mb-4'>Assessment not found.</p>
          <Link to='/launchpad' className='btn-secondary'>
            ← Back to Launch Pad
          </Link>
        </div>
      );
    }

    return <TakeAssessment assessment={assessment} />;
  }

  const assessments = data?.assessments || [];

  return (
    <div className='space-y-10'>
      <div>
        <div className='font-mono text-xs tracking-widest text-muted mb-2'>
          LAUNCH PAD / TAKE
        </div>

        <h1 className='font-head font-extrabold text-4xl sm:text-5xl text-ink h-mark'>
          Launch Pad
        </h1>

        <p className='text-muted mt-3 max-w-2xl'>
          Pick an assessment below to take it. Your answers will be saved to
          Reports.
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className='card-std p-12 text-center'>
          <Rocket className='mx-auto text-muted mb-4' size={40} />

          <h3 className='font-head font-bold text-2xl text-ink mb-2'>
            Nothing to launch
          </h3>

          <p className='text-muted mb-6'>Create an assessment first.</p>

          <Link to='/builder' className='btn-primary'>
            + Open Builder
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {assessments.map((a, i) => (
            <Link
              key={a._id}
              to={`/launchpad/${a._id}`}
              className='flex items-center justify-between p-5 card-std hover:border-ink hover:shadow-brut transition-all group'
            >
              <div className='flex items-center gap-5'>
                <div className='w-10 h-10 bg-ink text-white flex items-center justify-center font-head font-extrabold rounded-sm'>
                  {i + 1}
                </div>

                <div>
                  <h3 className='font-head font-bold text-lg text-ink'>
                    {a.title}
                  </h3>

                  <div className='font-mono text-xs text-muted'>
                    {a.categoryCount} categories · {a.questionCount} questions
                  </div>
                </div>
              </div>

              <ChevronRight size={20} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const TakeAssessment = ({ assessment }) => {
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitResponse, isLoading } = useCreateQuery({
    url: '/responses',
    queryKey: ['responses'],
    successMessage: 'Response submitted successfully',
  });

  const setAns = (qid, value) => setAnswers({ ...answers, [qid]: value });

  const allQuestions = assessment.categories.flatMap((c) =>
    c.factors.flatMap((f) =>
      f.questions.map((q) => ({
        ...q,
        _category: c.name,
        _factor: f.name,
      }))
    )
  );

  const handleSubmit = () => {
    const unanswered = allQuestions.filter((q) => {
      const a = answers[q._id];
      if (q.type === 'checkbox') return !a || a.length === 0;
      return a === undefined || a === '' || a === null;
    });

    if (unanswered.length > 0) {
      toast.error(`${unanswered.length} unanswered question(s)`);
      return;
    }

    submitResponse({
      assessmentId: assessment._id,
      respondentName: name,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className='max-w-2xl mx-auto text-center py-16'>
        <div className='card-brut p-12'>
          <div className='w-16 h-16 bg-accent text-white rounded-sm mx-auto flex items-center justify-center text-3xl font-head font-extrabold mb-6'>
            ✓
          </div>
          <h2 className='font-head font-extrabold text-3xl text-ink mb-3'>
            Thank you!
          </h2>
          <p className='text-muted mb-8'>
            Your response has been recorded for{' '}
            <span className='text-ink font-bold'>{assessment.title}</span>.
          </p>
          <div className='flex gap-3 justify-center'>
            <Link
              to={`/reports?assessment=${assessment._id}`}
              className='btn-primary'
              data-testid='post-submit-reports-btn'
            >
              View Reports
            </Link>
            <Link to='/launchpad' className='btn-secondary'>
              Back to Launch Pad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto space-y-8'>
      <Link
        to='/launchpad'
        className='inline-flex items-center gap-2 text-sm text-muted hover:text-ink font-bold'
        data-testid='take-back-btn'
      >
        <ArrowLeft size={14} /> Back to Launch Pad
      </Link>

      <div>
        <div className='font-mono text-xs tracking-widest text-muted mb-2'>
          TAKE ASSESSMENT
        </div>
        <h1 className='font-head font-extrabold text-4xl text-ink h-mark mb-2'>
          {assessment.title}
        </h1>
        {assessment.description && (
          <p className='text-muted'>{assessment.description}</p>
        )}
      </div>

      <div className='card-brut p-6'>
        <label className='label-tiny block mb-2'>Your name</label>
        <input
          type='text'
          className='input-base'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Anonymous'
          data-testid='take-name-input'
        />
      </div>

      {assessment.categories.map((cat, ci) => (
        <div key={cat._id || cat.name} className='space-y-5'>
          <div className='border-t-2 border-ink pt-4'>
            <div className='font-mono text-xs text-muted'>
              CATEGORY {ci + 1}
            </div>
            <h2 className='font-head font-extrabold text-2xl text-ink'>
              {cat.name}
            </h2>
          </div>

          {cat.factors.map((fac, fi) => (
            <div
              key={fac._id || fac.name}
              className='border-l-4 border-accent pl-5 space-y-4'
            >
              <h3 className='font-head font-bold text-lg text-ink'>
                {fac.name}
              </h3>
              {fac.questions.map((q, qi) => (
                <QuestionInput
                  key={q._id}
                  q={q}
                  idx={`${ci + 1}.${fi + 1}.${qi + 1}`}
                  value={answers[q._id]}
                  onChange={(v) => setAns(q._id, v)}
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      <div className='flex justify-end gap-3 pt-6 border-t border-subtle'>
        <Link to='/launchpad' className='btn-ghost'>
          Cancel
        </Link>
        <button
          className='btn-primary'
          onClick={handleSubmit}
          data-testid='take-submit-btn'
        >
          Submit response →
        </button>
      </div>
    </div>
  );
};

const QuestionInput = ({ q, idx, value, onChange }) => {
  const baseLabel = (
    <div className='font-mono text-xs text-muted mb-2'>Q{idx}</div>
  );
  return (
    <div className='card-std p-5' data-testid={`take-question-${q.id}`}>
      {baseLabel}
      <h4 className='font-head font-bold text-base text-ink mb-4'>{q.text}</h4>

      {q.type === 'multiple_choice' && (
        <div className='space-y-2'>
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 border-2 rounded-sm cursor-pointer transition-colors ${
                value === opt
                  ? 'border-ink bg-cream'
                  : 'border-subtle hover:border-ink'
              }`}
            >
              <input
                type='radio'
                name={q.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className='accent-accent'
                data-testid={`take-q-${q.id}-opt-${i}`}
              />
              <span className='font-mono text-xs text-muted'>
                {String.fromCharCode(65 + i)}.
              </span>
              <span className='text-ink'>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {q.type === 'checkbox' && (
        <div className='space-y-2'>
          {q.options.map((opt, i) => {
            const arr = Array.isArray(value) ? value : [];
            const checked = arr.includes(opt);
            return (
              <label
                key={i}
                className={`flex items-center gap-3 p-3 border-2 rounded-sm cursor-pointer transition-colors ${
                  checked
                    ? 'border-ink bg-cream'
                    : 'border-subtle hover:border-ink'
                }`}
              >
                <input
                  type='checkbox'
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked ? arr.filter((x) => x !== opt) : [...arr, opt]
                    )
                  }
                  className='accent-accent w-4 h-4'
                  data-testid={`take-q-${q.id}-opt-${i}`}
                />
                <span className='text-ink'>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.type === 'rating' && (
        <div className='flex gap-2'>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-12 h-12 border-2 rounded-sm font-head font-extrabold text-lg transition-all ${
                value === n
                  ? 'border-ink bg-ink text-white'
                  : 'border-subtle hover:border-ink text-ink'
              }`}
              data-testid={`take-q-${q.id}-rating-${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {q.type === 'yes_no' && (
        <div className='flex gap-3'>
          {['Yes', 'No'].map((opt) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`px-6 py-3 border-2 rounded-sm font-head font-bold transition-all ${
                value === opt
                  ? 'border-ink bg-ink text-white'
                  : 'border-subtle hover:border-ink text-ink'
              }`}
              data-testid={`take-q-${q.id}-yn-${opt.toLowerCase()}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'short_text' && (
        <input
          type='text'
          className='input-base'
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Your answer…'
          data-testid={`take-q-${q.id}-text`}
        />
      )}

      {q.type === 'long_text' && (
        <textarea
          rows={4}
          className='input-base'
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Your detailed answer…'
          data-testid={`take-q-${q.id}-textarea`}
        />
      )}
    </div>
  );
};

export default LaunchPad;
