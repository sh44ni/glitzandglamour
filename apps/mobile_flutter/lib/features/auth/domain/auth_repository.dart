abstract interface class AuthRepository {
  Future<String?> getCachedDisplayName();
  Future<void> signInWithEmail({
    required String email,
    required String password,
  });

  Future<void> signInWithGoogle();
  Future<void> signInWithApple();
  Future<void> signOut();
}

