import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button/Button';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import Checkbox from '../../components/form/Checkbox/Checkbox';
import { isEmail, isRequired } from '../../utils/validation';
import styles from './LoginPage.module.css';

/**
 * LoginPage — mock authentication form (UI only for Phase 7).
 *
 * Accepts any valid-looking email/password combination.
 * Real authentication arrives in Phase 8.
 */
function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});

  const from = location.state?.from || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = {};
    if (!isEmail(values.email)) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (isRequired(values.password)) {
      validationErrors.password = 'Password is required';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Mock login — accepts any credentials in Phase 7.
    login(values.email, values.password, values.remember);
    showToast('success', 'Welcome back! Signed in successfully.');
    navigate(from, { replace: true });
  };

  const handleForgotPassword = () => {
    showToast('info', 'Password reset is coming in a future phase.');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            ◈
          </span>
          <h1 className={styles.title}>Portfolio Admin</h1>
          <p className={styles.subtitle}>Sign in to manage your content</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            htmlFor="login-email"
            error={errors.email}
            required
          >
            <TextInput
              id="login-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              error={errors.email}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="login-password"
            error={errors.password}
            required
          >
            <TextInput
              id="login-password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              autoComplete="current-password"
            />
          </FormField>

          <div className={styles.actionsRow}>
            <Checkbox
              id="login-remember"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
              label="Remember me"
            />
            <button
              type="button"
              className={styles.forgotLink}
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" size="lg" className={styles.submit}>
            Sign In
          </Button>
        </form>

        <p className={styles.hint}>
          Phase 7 mock login — any email and password will work.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
