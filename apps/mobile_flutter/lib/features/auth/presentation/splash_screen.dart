import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../domain/auth_state.dart';
import 'auth_controller.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);

    ref.listen<AuthState>(authControllerProvider, (_, next) {
      if (!context.mounted) return;
      if (next.status == AuthStatus.unauthenticated) {
        context.go('/login');
      } else if (next.status == AuthStatus.authenticated) {
        context.go('/home');
      }
    });

    return Scaffold(
      body: Stack(
        children: [
          const _OrbsBackground(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(GGTokens.space6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Spacer(),
                  Text(
                    'Glitz & Glamour',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.6,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Member app',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: GGColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: 160,
                    child: LinearProgressIndicator(
                      minHeight: 6,
                      backgroundColor: Colors.white.withValues(alpha: 0.08),
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(GGColors.pink),
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    auth.status == AuthStatus.unknown
                        ? 'Preparing your experience…'
                        : auth.status == AuthStatus.authenticated
                            ? 'Welcome back…'
                            : 'Let’s get you signed in…',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: GGColors.textDim,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrbsBackground extends StatelessWidget {
  const _OrbsBackground();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: const [
        _Orb(
          alignment: Alignment(-1.15, -1.05),
          size: 520,
          colors: [GGColors.pink, Color(0xFF8B0043)],
        ),
        _Orb(
          alignment: Alignment(1.1, 1.0),
          size: 430,
          colors: [GGColors.purple, Color(0xFF3B0764)],
        ),
        _Orb(
          alignment: Alignment(0.65, -0.05),
          size: 320,
          colors: [GGColors.roseGold, Color(0xFF5C2232)],
        ),
      ],
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({
    required this.alignment,
    required this.size,
    required this.colors,
  });

  final Alignment alignment;
  final double size;
  final List<Color> colors;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: RadialGradient(
            colors: [
              colors.first.withValues(alpha: 0.90),
              colors.last.withValues(alpha: 0.40),
              Colors.transparent,
            ],
            stops: const [0.0, 0.55, 1.0],
          ),
        ),
      ),
    );
  }
}

