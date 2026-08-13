import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../store/api/authApi';
import { setCredentials, setInitialized, selectIsInitialized } from '../store/slices/authSlice';

/**
 * On first mount, the Redux store has no access token yet (page reload wipes
 * in-memory state), but the browser may still hold a valid httpOnly
 * `refreshToken` cookie from a previous session (see
 * `auth.controller.js` / `axiosBaseQuery.js`, both already implement the
 * cookie-rotation flow — this component is the missing piece that actually
 * calls it on load).
 *
 * Without this, `ProtectedRoute` (which waits on `isInitialized`) would spin
 * forever, since nothing ever dispatched `setInitialized(true)`.
 */
export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshResult = await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
        const accessToken = refreshResult?.data?.accessToken;
        if (accessToken && !cancelled) {
          dispatch(setCredentials({ accessToken }));
          await dispatch(authApi.endpoints.getMe.initiate()).unwrap();
        }
      } catch {
        // No valid session cookie (or it expired) — that's a normal, expected
        // outcome for a logged-out visitor, not an error to surface.
      } finally {
        if (!cancelled) dispatch(setInitialized(true));
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return children;
}
