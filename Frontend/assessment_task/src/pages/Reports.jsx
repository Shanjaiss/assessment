import { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BarChart3, ChevronDown, FileText } from 'lucide-react';
import { useFetchQuery } from '../components/hooks/useFetchQuery';
import Loader from '../components/loader/Loader';

const fmt = (v) => {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
};

const Reports = () => {
  const { data: assessmentsData, isLoading: loadingAssessments } =
    useFetchQuery({
      url: '/assessments',
      queryKey: ['assessments'],
    });

  const { data: responsesData, isLoading: loadingResponses } = useFetchQuery({
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

  // Fix: Safe string comparison for MongoDB ObjectIds
  const selected = assessments.find(
    (a) => String(a._id) === String(selectedId)
  );

  // Filter submissions belonging to the selected assessment
  const subs = useMemo(() => {
    if (!selectedId) return [];
    return responses.filter((r) => {
      const rId = r.assessment?._id || r.assessment;
      return String(rId) === String(selectedId);
    });
  }, [selectedId, responses]);

  // Dynamic fix for Question Length: Try counting the structural layout first.
  // If the backend didn't fetch full structure, pull the count from the flat answers array!
  const totalQuestionsCount = useMemo(() => {
    if (selected?.categories && selected.categories.length > 0) {
      return selected.categories.reduce(
        (acc, cat) =>
          acc +
          (cat.factors?.reduce(
            (fAcc, fac) => fAcc + (fac.questions?.length || 0),
            0
          ) || 0),
        0
      );
    }
    // Fallback: Use the flat answers count from your Mongoose document structure
    return subs[0]?.answers?.length || 0;
  }, [selected, subs]);

  const isLoading = loadingAssessments || loadingResponses;

  if (isLoading) {
    return <Loader fullScreen tip='Loading reports...' />;
  }

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
                <option key={String(a._id)} value={String(a._id)}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* STATS */}
          <div className='grid grid-cols-3 gap-6'>
            <Stat label='Submissions' value={subs.length} />
            <Stat label='Questions' value={totalQuestionsCount} />
            <Stat
              label='Latest'
              value={
                subs[0] ? new Date(subs[0].createdAt).toLocaleDateString() : '—'
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
              {subs.map((r) => {
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
                        <div className='font-bold'>
                          {r.respondentName || 'Anonymous Submitter'}
                        </div>

                        <div className='text-xs text-muted'>
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <ChevronDown className={open ? '' : '-rotate-90'} />
                    </button>

                    {open && (
                      <div className='p-6 space-y-3'>
                        {r.answers?.map((ans, index) => (
                          <div
                            key={ans.questionId || index}
                            className='grid md:grid-cols-2 gap-4 py-3 border-b last:border-b-0'
                          >
                            <div>
                              <div className='text-xs text-muted mb-1'>
                                Q{index + 1} • {ans.categoryName} /{' '}
                                {ans.factorName}
                              </div>

                              <div className='font-medium break-words whitespace-pre-wrap text-left max-w-prose'>
                                {ans.questionText}
                              </div>
                            </div>

                            <div className='font-bold text-left md:text-right break-words whitespace-pre-wrap max-w-prose self-center'>
                              {fmt(ans.answer)}
                            </div>
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
