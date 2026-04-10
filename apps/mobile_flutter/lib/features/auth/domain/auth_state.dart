import 'package:flutter/foundation.dart';

@immutable
class AuthState {
  const AuthState._({
    required this.status,
    this.userDisplayName,
  });

  final AuthStatus status;
  final String? userDisplayName;

  const AuthState.unknown() : this._(status: AuthStatus.unknown);
  const AuthState.unauthenticated() : this._(status: AuthStatus.unauthenticated);

  const AuthState.authenticated({
    required String userDisplayName,
  }) : this._(status: AuthStatus.authenticated, userDisplayName: userDisplayName);
}

enum AuthStatus { unknown, unauthenticated, authenticated }

