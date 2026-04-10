import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/config/app_config.dart';
import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/gg_gradient_button.dart';
import '../../../app/widgets/section_header.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(GGTokens.space6),
          children: [
            const SectionHeader(
              title: 'Welcome back',
              subtitle: 'Sign in to access your member experience.',
            ),
            const SizedBox(height: GGTokens.space4),
            GGCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Email', style: _labelStyle(context)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    autofillHints: const [AutofillHints.email],
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      hintText: 'you@example.com',
                    ),
                  ),
                  const SizedBox(height: GGTokens.space4),
                  Text('Password', style: _labelStyle(context)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    autofillHints: const [AutofillHints.password],
                    textInputAction: TextInputAction.done,
                    decoration: const InputDecoration(
                      hintText: '••••••••',
                    ),
                  ),
                  const SizedBox(height: GGTokens.space5),
                  Center(
                    child: GGGradientButton(
                      label: 'Sign in',
                      icon: Icons.lock_rounded,
                      onPressed: () async {
                        await _openWebSignIn();
                      },
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.06, end: 0),
            const SizedBox(height: GGTokens.space5),
            Text(
              'Or continue with',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: GGColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: GGTokens.space4),
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 12,
              runSpacing: 12,
              children: [
                GGGradientButton(
                  label: 'Google',
                  icon: Icons.g_mobiledata_rounded,
                  isPrimary: false,
                  onPressed: () async {
                    await _openProvider('google');
                  },
                ),
                GGGradientButton(
                  label: 'Apple',
                  icon: Icons.apple_rounded,
                  isPrimary: false,
                  onPressed: () async {
                    await _openProvider('apple');
                  },
                ),
              ],
            ).animate().fadeIn(delay: 150.ms, duration: 350.ms),
            const SizedBox(height: GGTokens.space6),
            Center(
              child: TextButton(
                onPressed: () => context.go('/signup'),
                child: const Text('New here? Create an account'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  TextStyle _labelStyle(BuildContext context) {
    return Theme.of(context).textTheme.labelSmall?.copyWith(
          color: GGColors.textMuted,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.6,
        ) ??
        const TextStyle();
  }

  Future<void> _openWebSignIn() async {
    final base = AppConfig.webBaseUrl;
    final uri = Uri.parse('$base/sign-in?callbackUrl=/app/auth/callback');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _openProvider(String provider) async {
    final base = AppConfig.webBaseUrl;
    final uri = Uri.parse(
      '$base/api/auth/signin/$provider?callbackUrl=/app/auth/callback',
    );
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

