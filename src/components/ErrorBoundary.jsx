import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error(`[ErrorBoundary: ${this.props.name || 'unknown'}]`, error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            // Silent fallback — renders nothing so the rest of the app keeps running.
            // The name prop is used for console identification only.
            if (this.props.fallback) return this.props.fallback;
            return null;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
