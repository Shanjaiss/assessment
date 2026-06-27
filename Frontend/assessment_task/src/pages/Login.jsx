import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateQuery } from '../components/hooks/useCreateQuery';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const loginMutation = useCreateQuery({
    url: '/auth/login',
    queryKey: ['users'],
    successMessage: 'Welcome Back!',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.email) {
      setError('Please enter Email');
      return;
    }

    if (!form.password) {
      setError('Please enter Password');
      return;
    }

    loginMutation.mutate(form, {
      onSuccess: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/builder');
      },

      onError: (error) => {
        setError(error?.response?.data?.message || 'Login failed');
      },
    });
  };

  return (
    <div className='min-h-screen flex bg-paper'>
      <div
        className='hidden lg:flex w-1/2 relative items-end p-12'
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/30179908/pexels-photo-30179908.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-ink/30' />

        <div className='relative z-10 text-white max-w-md'>
          <div className='font-mono text-xs tracking-widest mb-4 opacity-90'>
            ASSESSO / 01
          </div>

          <h1 className='font-head font-extrabold text-4xl sm:text-5xl leading-none mb-4'>
            Structured assessments,
            <br />
            built in minutes.
          </h1>

          <p className='font-body text-white/90 text-base'>
            Design hierarchical evaluations — Categories, Factors, Questions —
            and ship them to your team without the bloat.
          </p>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <div className='font-mono text-xs tracking-widest text-muted mb-2'>
            LOGIN / RETURNING USER
          </div>

          <h2 className='font-head font-extrabold text-4xl text-ink mb-8 h-mark'>
            Sign in
          </h2>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-5'
            data-testid='login-form'
          >
            <div>
              <label className='label-tiny block mb-2'>Email</label>

              <input
                type='email'
                className='input-base'
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder='Enter Email'
                data-testid='login-email-input'
              />
            </div>

            <div>
              <label className='label-tiny block mb-2'>Password</label>

              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='input-base w-full pr-12'
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder='Enter Password'
                  data-testid='login-password-input'
                />

                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className='text-danger text-sm font-medium border-l-4 border-danger pl-3'
                data-testid='login-error'
              >
                {error}
              </div>
            )}

            <button
              type='submit'
              className='btn-primary mt-2'
              data-testid='login-submit-btn'
            >
              Sign in →
            </button>
          </form>

          <p className='mt-8 text-sm text-muted'>
            No account?{' '}
            <Link
              to='/register'
              className='font-bold text-ink underline underline-offset-4 hover:text-accent'
              data-testid='login-to-register-link'
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
