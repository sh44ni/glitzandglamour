import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_controller.dart';

final deepLinkListenerProvider = Provider<DeepLinkListener>((ref) {
  final listener = DeepLinkListener(ref);
  ref.onDispose(listener.dispose);
  return listener;
});

class DeepLinkListener {
  DeepLinkListener(this._ref) {
    _init();
  }

  final Ref _ref;
  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _sub;

  Future<void> _init() async {
    // Handle cold start.
    final initial = await _appLinks.getInitialLink();
    if (initial != null) {
      await _handle(initial);
    }

    // Handle warm links.
    _sub = _appLinks.uriLinkStream.listen((uri) async {
      await _handle(uri);
    });
  }

  Future<void> _handle(Uri uri) async {
    // Expected: glitzmember://auth/callback?code=...
    final code = uri.queryParameters['code'];
    if (code == null || code.isEmpty) return;
    await _ref.read(authControllerProvider.notifier).completeWebLoginWithCode(code);
  }

  void dispose() {
    _sub?.cancel();
  }
}

