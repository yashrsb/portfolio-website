import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button/Button';
import FormField from '../../components/form/FormField/FormField';
import TextInput from '../../components/form/TextInput/TextInput';
import Checkbox from '../../components/form/Checkbox/Checkbox';
import ApiErrorBanner from '../../components/common/errors/ApiErrorBanner/ApiErrorBanner';
import { isEmail, isRequired } from '../../utils/validation';
import { normalizeApiError } from '../../utils/apiErrors';
import styles from './LoginPage.module.css';

/**
 * LoginPage — real authentication form.
 *
 * Submits credentials via authService.login, shows loading state, surfaces
 * server/network errors, and redirects to the originally requested route
 * (or the dashboard) on success.
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
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // `from` may be a path string or a location object (from ProtectedRoute).
  const fromState = location.state?.from;
  const from =
    typeof fromState === 'string'
      ? fromState
      : fromState?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    const validationErrors = {};
    if (!isEmail(values.email)) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (isRequired(values.password)) {
      validationErrors.password = 'Password is required';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await login(values.email, values.password, values.remember);
      showToast('success', 'Welcome back! Signed in successfully.');
      navigate(from, { replace: true });
    } catch (error) {
      const normalized = normalizeApiError(error);
      setApiError(normalized);
      if (normalized.fieldErrors.length > 0) {
        const fieldMap = {};
        normalized.fieldErrors.forEach((fe) => {
          fieldMap[fe.field] = fe.message;
        });
        setErrors(fieldMap);
      }
    } finally {
      setSubmitting(false);
    }
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

        {apiError && <ApiErrorBanner error={apiError} />}

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
              disabled={submitting}
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
              disabled={submitting}
            />
          </FormField>

          <div className={styles.actionsRow}>
            <Checkbox
              id="login-remember"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
              label="Remember me"
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className={styles.submit}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
