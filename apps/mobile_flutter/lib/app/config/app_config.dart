class AppConfig {
  AppConfig._();

  /// Public website base URL used for browser-based login flows.
  static const webBaseUrl = String.fromEnvironment(
    'WEB_BASE_URL',
    defaultValue: 'https://glitzandglamours.com',
  );

  /// Example:
  /// flutter run --dart-define=API_BASE_URL=http://192.168.1.50:3000
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  /// Placeholder for token exchange (Google/Apple) or API keys.
  /// Keep real secrets out of source control.
  static const publicClientId = String.fromEnvironment('PUBLIC_CLIENT_ID', defaultValue: '');

  /// Use mock auth for UI development until backend token exchange is ready.
  static const useMockAuth =
      bool.fromEnvironment('USE_MOCK_AUTH', defaultValue: true);
}

