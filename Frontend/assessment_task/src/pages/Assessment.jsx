import { Link } from 'react-router-dom';
import { Plus, ClipboardList, Rocket, BarChart3 } from 'lucide-react';
import { useFetchQuery } from '../components/hooks/useFetchQuery';
import Loader from '../components/loader/Loader';

const Assessments = () => {
  const { data, isLoading, error } = useFetchQuery({
    url: '/assessments',
    queryKey: ['assessments'],
  });

  const assessments = data?.assessments || [];

  if (isLoading) {
    return <Loader fullScreen tip='Loading assessments...' />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className='space-y-10'>
      {' '}
      <div className='flex flex-col md:flex-row justify-between md:items-end gap-4'>
        {' '}
        <div>
          {' '}
          <div className='font-mono text-xs tracking-widest text-muted mb-2'>
            ASSESSMENTS / LIBRARY{' '}
          </div>{' '}
          <h1 className='font-head font-extrabold text-4xl sm:text-5xl text-ink h-mark'>
            Your assessments{' '}
          </h1>{' '}
        </div>
        ```
        <Link
          to='/builder'
          className='btn-primary flex items-center gap-2 w-fit'
        >
          <Plus size={16} /> New assessment
        </Link>
      </div>
      {assessments.length === 0 ? (
        <div className='card-std p-12 text-center'>
          <ClipboardList className='mx-auto text-muted mb-4' size={40} />

          <h3 className='font-head font-bold text-2xl text-ink mb-2'>
            No assessments yet
          </h3>

          <p className='text-muted mb-6'>
            Build your first one in the Builder.
          </p>

          <Link to='/builder' className='btn-primary'>
            + Create assessment
          </Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {assessments.map((a, i) => (
            <div
              key={a._id}
              className='card-brut p-6 hover:-translate-y-0.5 transition-transform'
            >
              <div className='font-mono text-xs text-muted mb-2'>
                #{String(i + 1).padStart(3, '0')} ·{' '}
                {new Date(a.createdAt).toLocaleDateString()}
              </div>

              <h3 className='font-head font-extrabold text-xl text-ink mb-2'>
                {a.title}
              </h3>

              {a.description && (
                <p className='text-muted text-sm mb-4 line-clamp-2'>
                  {a.description}
                </p>
              )}

              <div className='grid grid-cols-3 gap-2 mb-5 text-center'>
                <div className='border border-subtle p-2 rounded-sm'>
                  <div className='font-mono text-lg font-bold text-ink'>
                    {a.categoryCount || 0}
                  </div>
                  <div className='text-[10px] uppercase tracking-widest text-muted'>
                    Cats
                  </div>
                </div>

                <div className='border border-subtle p-2 rounded-sm'>
                  <div className='font-mono text-lg font-bold text-ink'>-</div>
                  <div className='text-[10px] uppercase tracking-widest text-muted'>
                    Factors
                  </div>
                </div>

                <div className='border border-subtle p-2 rounded-sm'>
                  <div className='font-mono text-lg font-bold text-accent'>
                    {a.questionCount || 0}
                  </div>
                  <div className='text-[10px] uppercase tracking-widest text-muted'>
                    Qs
                  </div>
                </div>
              </div>

              <div className='flex gap-2'>
                <Link
                  to={`/launchpad/${a._id}`}
                  className='btn-primary flex-1 flex items-center justify-center gap-2 !px-4 !py-2 text-sm'
                >
                  <Rocket size={14} /> Launch
                </Link>

                <Link
                  to={`/reports?assessment=${a._id}`}
                  className='btn-secondary !px-4 !py-2 text-sm flex items-center gap-2'
                >
                  <BarChart3 size={14} /> Reports
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assessments;
