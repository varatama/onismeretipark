export const TRIAL_LIMIT = 2; // Max unauthenticated attraction views

export const getTrialViews = (): number => {
    if (typeof window === 'undefined') return 0;
    const views = localStorage.getItem('trial_views');
    return views ? parseInt(views, 10) : 0;
};

export const incrementTrialViews = (): number => {
    if (typeof window === 'undefined') return 0;
    const current = getTrialViews();
    const next = current + 1;
    localStorage.setItem('trial_views', next.toString());
    return next;
};

export const isTrialLimitReached = (): boolean => {
    return getTrialViews() >= TRIAL_LIMIT;
};
