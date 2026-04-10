import 'dart:async';

import '../domain/auth_repository.dart';

class MockAuthRepository implements AuthRepository {
  String? _displayName;

  @override
  Future<String?> getCachedDisplayName() async => _displayName;

  @override
  Future<void> signInWithApple() async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    _displayName = 'Glitz Member';
  }

  @override
  Future<void> signInWithEmail({
    required String email,
    required String password,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    _displayName = 'Glitz Member';
  }

  @override
  Future<void> signInWithGoogle() async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    _displayName = 'Glitz Member';
  }

  @override
  Future<void> signOut() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    _displayName = null;
  }
}

