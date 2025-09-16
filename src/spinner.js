var spinner = null;
const loadingTokens = new Set();

export function setSpinner(spinnerElement) {
    spinner = spinnerElement;
}

export function startLoading(token) {
    if (spinner === null) {
        return;
    }
    loadingTokens.add(token);
    spinner.style.display = 'block';
}

export function stopLoading(token) {
    if (spinner === null) {
        return;
    }
    loadingTokens.delete(token);
    if (loadingTokens.size === 0) {
        spinner.style.display = 'none';
    }
}