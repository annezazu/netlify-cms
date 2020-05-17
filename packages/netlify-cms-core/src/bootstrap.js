import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { Provider, connect } from 'react-redux';
import { Route } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import history from 'Routing/history';
import store from 'ReduxStore';
import { mergeConfig } from 'Actions/config';
import { getPhrases } from 'Lib/phrases';
import { selectLocale } from 'Reducers/config';
import { I18n } from 'react-polyglot';
import { ThemeProvider } from 'emotion-theming';
import { GlobalStyles as GlobalLegacyStyles } from 'netlify-cms-ui-legacy';
import { ErrorBoundary } from 'UI';
import { lightTheme, darkTheme, GlobalStyles, UIContext, UIProvider } from 'netlify-cms-ui-default';
import App from 'App/App';
import 'EditorWidgets';
import 'coreSrc/mediaLibrary';
import 'what-input';

const ROOT_ID = 'nc-root';

const TranslatedApp = ({ locale, config }) => {
  return (
    <I18n locale={locale} messages={getPhrases(locale)}>
      <ErrorBoundary showBackup config={config}>
        <ConnectedRouter history={history}>
          <Route component={App} />
        </ConnectedRouter>
      </ErrorBoundary>
    </I18n>
  );
};

const mapDispatchToProps = state => {
  return { locale: selectLocale(state.config), config: state.config };
};

const ConnectedTranslatedApp = connect(mapDispatchToProps)(TranslatedApp);

function bootstrap(opts = {}) {
  const { config } = opts;

  /**
   * Log the version number.
   */
  if (typeof NETLIFY_CMS_CORE_VERSION === 'string') {
    console.log(`netlify-cms-core ${NETLIFY_CMS_CORE_VERSION}`);
  }

  /**
   * Get DOM element where app will mount.
   */
  function getRoot() {
    /**
     * Return existing root if found.
     */
    const existingRoot = document.getElementById(ROOT_ID);
    if (existingRoot) {
      return existingRoot;
    }

    /**
     * If no existing root, create and return a new root.
     */
    const newRoot = document.createElement('div');
    newRoot.id = ROOT_ID;
    document.body.appendChild(newRoot);
    return newRoot;
  }

  /**
   * Dispatch config to store if received. This config will be merged into
   * config.yml if it exists, and any portion that produces a conflict will be
   * overwritten.
   */
  if (config) {
    store.dispatch(mergeConfig(config));
  }

  /**
   * Create connected root component.
   */
  const Root = () => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;

      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    useEffect(() => {
      window.addEventListener('resize', handleResize);
      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <UIProvider>
        <UIContext.Consumer>
          {({ darkMode }) => (
            <ThemeProvider
              theme={darkMode ? { darkMode, ...darkTheme } : { darkMode, ...lightTheme }}
            >
              <GlobalLegacyStyles />
              <GlobalStyles />
              <Provider store={store}>
                <ConnectedTranslatedApp />
              </Provider>
            </ThemeProvider>
          )}
        </UIContext.Consumer>
      </UIProvider>
    );
  };

  /**
   * Render application root.
   */
  render(<Root />, getRoot());
}

export default bootstrap;
