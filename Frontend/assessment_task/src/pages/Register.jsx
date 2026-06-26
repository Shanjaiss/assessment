import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateQuery } from '../components/hooks/useCreateQuery';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const registerMutation = useCreateQuery({
    url: '/auth/register',
    queryKey: ['users'],
    successMessage: 'Account created successfully',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    registerMutation.mutate(form, {
      onSuccess: (data) => {
        if (data?.token) {
          localStorage.setItem('token', data.token);
        }

        if (data?.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        toast.success("Account created. Let's build.");
        navigate('/builder');
      },
      onError: (error) => {
        setError(error?.response?.data?.message || 'Registration failed');
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
            ASSESSO / 02
          </div>

          <h1 className='font-head font-extrabold text-4xl sm:text-5xl leading-none mb-4'>
            Start measuring
            <br />
            what matters.
          </h1>

          <p className='font-body text-white/90 text-base'>
            Create your first assessment in under 60 seconds. No credit card, no
            setup, no nonsense.
          </p>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          <div className='font-mono text-xs tracking-widest text-muted mb-2'>
            REGISTER / NEW USER
          </div>

          <h2 className='font-head font-extrabold text-4xl text-ink mb-8 h-mark'>
            Create account
          </h2>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-5'
            data-testid='register-form'
          >
            <div>
              <label className='label-tiny block mb-2'>Full name</label>

              <input
                type='text'
                className='input-base'
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder='Jane Architect'
                data-testid='register-name-input'
              />
            </div>

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
                placeholder='you@company.com'
                data-testid='register-email-input'
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
                  placeholder='Min. 6 characters'
                  data-testid='register-password-input'
                />

                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className='text-danger text-sm font-medium border-l-4 border-danger pl-3'
                data-testid='register-error'
              >
                {error}
              </div>
            )}

            <button
              type='submit'
              className='btn-primary mt-2'
              data-testid='register-submit-btn'
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating...' : 'Create account →'}
            </button>
          </form>

          <p className='mt-8 text-sm text-muted'>
            Already have an account?{' '}
            <Link
              to='/login'
              className='font-bold text-ink underline underline-offset-4 hover:text-accent'
              data-testid='register-to-login-link'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
