import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router/app_router.dart';
import 'theme/gg_theme.dart';
import '../features/auth/presentation/deep_link_listener.dart';

class GlitzApp extends ConsumerWidget {
  const GlitzApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize deep link listener (auth callback).
    ref.watch(deepLinkListenerProvider);

    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Glitz & Glamour',
      debugShowCheckedModeBanner: false,
      theme: GGTheme.dark(),
      routerConfig: router,
    );
  }
}

