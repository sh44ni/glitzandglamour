import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/config/app_config.dart';
import '../../../data/api/api_client.dart';
import '../data/backend_auth_repository.dart';
import '../data/mock_auth_repository.dart';
import '../domain/auth_repository.dart';
import '../domain/auth_state.dart';

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return const SessionStorage();
});

class SessionStorage {
  const SessionStorage();
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  if (AppConfig.useMockAuth) {
    return MockAuthRepository();
  }
  final dio = ref.read(dioProvider);
  return BackendAuthRepository.fromDio(dio);
});

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() {
    _bootstrap();
    return const AuthState.unknown();
  }

  Future<void> _bootstrap() async {
    final repo = ref.read(authRepositoryProvider);
    final cached = await repo.getCachedDisplayName();
    if (cached == null) {
      state = const AuthState.unauthenticated();
    } else {
      state = AuthState.authenticated(userDisplayName: cached);
    }
  }

  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    // Browser-based auth: open the website sign-in instead of handling credentials here.
    state = const AuthState.unauthenticated();
  }

  Future<void> signInWithGoogle() async {
    state = const AuthState.unauthenticated();
  }

  Future<void> signInWithApple() async {
    state = const AuthState.unauthenticated();
  }

  Future<void> completeWebLoginWithCode(String code) async {
    final repo = ref.read(authRepositoryProvider);
    // For now, delegate to backend repo implementation; mock repo will just set a displayName.
    if (repo is BackendAuthRepository) {
      final result = await repo.exchangeOneTimeCode(code);
      state = AuthState.authenticated(
        userDisplayName: result.userDisplayName,
      );
      return;
    }

    // Mock fallback for UI
    await repo.signInWithGoogle();
    state = const AuthState.authenticated(userDisplayName: 'Glitz Member');
  }

  Future<void> signOut() async {
    final repo = ref.read(authRepositoryProvider);
    await repo.signOut();
    state = const AuthState.unauthenticated();
  }
}

