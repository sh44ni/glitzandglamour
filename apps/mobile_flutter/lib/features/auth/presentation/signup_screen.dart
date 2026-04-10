import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/gg_gradient_button.dart';
import '../../../app/widgets/section_header.dart';
import 'auth_controller.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
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
              title: 'Create your account',
              subtitle: 'Your rewards, appointments, and perks live here.',
            ),
            const SizedBox(height: GGTokens.space4),
            GGCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Name', style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _name,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(hintText: 'Your name'),
                  ),
                  const SizedBox(height: GGTokens.space4),
                  Text('Email', style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(hintText: 'you@example.com'),
                  ),
                  const SizedBox(height: GGTokens.space4),
                  Text('Password', style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _password,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    decoration: const InputDecoration(hintText: '••••••••'),
                  ),
                  const SizedBox(height: GGTokens.space5),
                  Center(
                    child: GGGradientButton(
                      label: 'Create account (placeholder)',
                      icon: Icons.person_add_rounded,
                      onPressed: () async {
                        // Placeholder: for now, treat signup as signed-in.
                        await ref.read(authControllerProvider.notifier).signInWithEmail(
                              email: _email.text.trim(),
                              password: _password.text,
                            );
                      },
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.06, end: 0),
            const SizedBox(height: GGTokens.space6),
            Center(
              child: TextButton(
                onPressed: () => context.go('/login'),
                child: const Text('Already have an account? Sign in'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

