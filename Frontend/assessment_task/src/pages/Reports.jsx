import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart3, ChevronDown, FileText } from 'lucide-react';
import { useFetchQuery } from '../components/hooks/useFetchQuery';

const fmt = (v) => {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
};

const Reports = () => {
  const { data: assessmentsData } = useFetchQuery({
    url: '/assessments',
    queryKey: ['assessments'],
  });

  const { data: responsesData } = useFetchQuery({
    url: '/responses',
    queryKey: ['responses'],
  });

  const assessments = assessmentsData?.assessments || [];
  const responses = responsesData?.responses || [];

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselect = params.get('assessment');

  const [selectedId, setSelectedId] = useState(preselect || '');
  const [expanded, setExpanded] = useState({});

  const selected = assessments.find((a) => a._id === selectedId);

  const subs = useMemo(() => {
    if (!selectedId) return [];
    return responses.filter((r) => r.assessmentId === selectedId);
  }, [selectedId, responses]);

  // ✅ FIXED: safe flattening of questions
  const allQuestions = useMemo(() => {
    if (!selected?.categories) return [];

    return selected.categories.flatMap((category, ci) =>
      category.factors.flatMap((factor, fi) =>
        factor.questions.map((q, qi) => ({
          ...q,
          ref: `${ci + 1}.${fi + 1}.${qi + 1}`,
          category: category.name,
          factor: factor.name,
        }))
      )
    );
  }, [selected]);

  // helper to safely get answer
  const getAnswer = (response, questionId) => {
    if (!response?.answers) return null;

    for (const cat of response.answers) {
      for (const fac of cat.factors || []) {
        const found = fac.questions?.find((q) => q._id === questionId);
        if (found) return found.value ?? found.answer ?? found.response;
      }
    }
    return null;
  };

  return (
    <div className='space-y-10'>
      {/* HEADER */}
      <div>
        <div className='font-mono text-xs tracking-widest text-muted mb-2'>
          REPORTS / RESPONSES
        </div>
        <h1 className='font-head font-extrabold text-4xl sm:text-5xl text-ink'>
          Reports
        </h1>
      </div>

      {/* NO ASSESSMENTS */}
      {assessments.length === 0 ? (
        <div className='card-std p-12 text-center'>
          <BarChart3 className='mx-auto text-muted mb-4' size={40} />
          <h3 className='font-head font-bold text-2xl text-ink mb-2'>
            No data yet
          </h3>
          <p className='text-muted mb-6'>
            Create an assessment and collect responses to see reports.
          </p>
          <Link to='/builder' className='btn-primary'>
            + Build assessment
          </Link>
        </div>
      ) : (
        <>
          {/* SELECT */}
          <div className='card-brut p-6'>
            <label className='label-tiny block mb-2'>Select assessment</label>

            <select
              className='input-base'
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value=''>Select</option>
              {assessments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* STATS */}
          <div className='grid grid-cols-3 gap-6'>
            <Stat label='Submissions' value={subs.length} />
            <Stat label='Questions' value={allQuestions.length} />
            <Stat
              label='Latest'
              value={
                subs[0]
                  ? new Date(subs[0].submittedAt).toLocaleDateString()
                  : '—'
              }
              isText
            />
          </div>

          {/* NO RESPONSES */}
          {subs.length === 0 ? (
            <div className='card-std p-12 text-center'>
              <FileText className='mx-auto text-muted mb-4' size={40} />
              <h3 className='font-head font-bold text-xl text-ink mb-2'>
                No submissions yet
              </h3>
              <p className='text-muted mb-6'>
                Share the assessment to collect responses.
              </p>
              <Link to={`/launchpad/${selectedId}`} className='btn-primary'>
                Take it now
              </Link>
            </div>
          ) : (
            /* RESPONSES LIST */
            <div className='space-y-4'>
              {subs.map((r, ri) => {
                const open = expanded[r._id];

                return (
                  <div
                    key={r._id}
                    className='bg-surface border-2 border-ink rounded-sm'
                  >
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [r._id]: !prev[r._id],
                        }))
                      }
                      className='w-full flex items-center justify-between p-5 bg-cream border-b-2 border-ink'
                    >
                      <div className='text-left'>
                        <div className='font-bold'>{r.respondentName}</div>
                        <div className='text-xs text-muted'>
                          {new Date(r.submittedAt).toLocaleString()}
                        </div>
                      </div>

                      <ChevronDown className={open ? '' : '-rotate-90'} />
                    </button>

                    {open && (
                      <div className='p-6 space-y-6'>
                        {r.answers?.map((cat, ci) => (
                          <div key={cat._id}>
                            <h3 className='font-bold mb-3'>{cat.name}</h3>

                            {cat.factors?.map((fac, fi) => (
                              <div
                                key={fac._id}
                                className='border-l-4 border-accent pl-4 mb-4'
                              >
                                <div className='font-semibold mb-2'>
                                  {fac.name}
                                </div>

                                {fac.questions?.map((q, qi) => (
                                  <div
                                    key={q._id}
                                    className='grid md:grid-cols-2 gap-3 py-2 border-b last:border-0'
                                  >
                                    <div>
                                      <div className='text-xs text-muted'>
                                        Q {ci + 1}.{fi + 1}.{qi + 1}
                                      </div>
                                      <div>{q.text}</div>
                                    </div>

                                    <div className='font-bold'>
                                      {fmt(getAnswer(r, q._id))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* STAT COMPONENT */
const Stat = ({ label, value, isText }) => (
  <div className='card-std p-5'>
    <div className='text-xs text-muted'>{label}</div>
    <div
      className={
        isText ? 'text-xl font-bold' : 'text-3xl font-mono font-extrabold'
      }
    >
      {value}
    </div>
  </div>
);

export default Reports;
