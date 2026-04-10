import 'package:dio/dio.dart';

import '../domain/auth_repository.dart';

class ExchangeResult {
  const ExchangeResult({
    required this.accessToken,
    required this.refreshToken,
    required this.userDisplayName,
  });

  final String accessToken;
  final String refreshToken;
  final String userDisplayName;
}

/// Placeholder backend-aligned auth repository.
///
/// Your current web app uses NextAuth/Auth.js + custom routes like:
/// - /api/auth/signup
/// - /api/auth/verify-email
/// - /api/profile (protected)
/// - /api/bookings (protected)
/// - /api/loyalty (protected)
///
/// Mobile typically needs token-based auth (not cookie-based sessions).
/// When ready, implement token exchange endpoints on your backend and call them here.
class BackendAuthRepository implements AuthRepository {
  BackendAuthRepository(this._dio);

  final Dio _dio;

  factory BackendAuthRepository.fromDio(Dio dio) => BackendAuthRepository(dio);

  String get _baseUrl => _dio.options.baseUrl;

  Future<ExchangeResult> exchangeOneTimeCode(String code) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/api/mobile/auth/exchange',
      data: {'code': code},
    );
    final data = res.data ?? const <String, dynamic>{};
    return ExchangeResult(
      accessToken: (data['accessToken'] as String?) ?? '',
      refreshToken: (data['refreshToken'] as String?) ?? '',
      userDisplayName: (data['user'] as Map?)?['name'] as String? ?? 'Glitz Member',
    );
  }

  @override
  Future<String?> getCachedDisplayName() async {
    // TODO: load from secure storage
    // Touch dio until real calls are implemented.
    _baseUrl;
    return null;
  }

  @override
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    // TODO: implement a mobile-friendly endpoint (token-based)
    // Example: await _dio.post('/api/mobile/auth/email', data: {...});
    _baseUrl;
    await Future<void>.delayed(const Duration(milliseconds: 250));
  }

  @override
  Future<void> signInWithGoogle() async {
    // TODO: obtain Google idToken on-device then exchange with backend.
    _baseUrl;
    await Future<void>.delayed(const Duration(milliseconds: 250));
  }

  @override
  Future<void> signInWithApple() async {
    // TODO: obtain Apple identityToken on-device then exchange with backend.
    _baseUrl;
    await Future<void>.delayed(const Duration(milliseconds: 250));
  }

  @override
  Future<void> signOut() async {
    // TODO: clear tokens from secure storage
    _baseUrl;
    await Future<void>.delayed(const Duration(milliseconds: 150));
  }
}

