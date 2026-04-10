import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';
import '../../../app/widgets/stamp_tracker.dart';
import '../../auth/presentation/auth_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final name = auth.userDisplayName ?? 'Member';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Home',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        actions: [
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => context.go('/home/notifications'),
            icon: const Icon(Icons.notifications_none_rounded),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          GGTokens.space6,
          GGTokens.space3,
          GGTokens.space6,
          GGTokens.space6,
        ),
        children: [
          Text(
            'Hi, $name',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.4,
                ),
          ),
          const SizedBox(height: 6),
          Text(
            'This is your private member space — rewards, appointments, and perks.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: GGColors.textMuted,
                ),
          ),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Your loyalty progress',
            subtitle: '10 stamps = a free nail set',
          ),
          GGCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                StampProgressLabel(stamps: 6),
                SizedBox(height: GGTokens.space4),
                StampTracker(stamps: 6),
              ],
            ),
          ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.05, end: 0),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Upcoming appointment',
            subtitle: 'Next visit at a glance',
          ),
          GGCard(
            onTap: () => context.go('/appointments'),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [GGColors.pink, GGColors.pinkLight],
                    ),
                  ),
                  child: const Icon(Icons.event_rounded, color: Colors.white),
                ),
                const SizedBox(width: GGTokens.space4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'No appointment scheduled yet',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Tap to view appointments or book your next visit.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: GGColors.textMuted,
                            ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: GGColors.textDim),
              ],
            ),
          ).animate().fadeIn(delay: 120.ms, duration: 350.ms),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(title: 'Quick actions'),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _QuickAction(
                label: 'Book appointment',
                icon: Icons.calendar_month_rounded,
                onTap: () => context.go('/book'),
              ),
              _QuickAction(
                label: 'My rewards',
                icon: Icons.loyalty_rounded,
                onTap: () => context.go('/rewards'),
              ),
              _QuickAction(
                label: 'Appointments',
                icon: Icons.event_note_rounded,
                onTap: () => context.go('/appointments'),
              ),
              _QuickAction(
                label: 'Leave review',
                icon: Icons.rate_review_rounded,
                onTap: () => context.go('/rewards/review-reward'),
              ),
            ],
          ).animate().fadeIn(delay: 180.ms, duration: 350.ms),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Birthday reward',
            subtitle: 'A little extra love — just for you',
          ),
          GGCard(
            child: Row(
              children: [
                const Icon(Icons.cake_rounded, color: GGColors.roseGold),
                const SizedBox(width: GGTokens.space4),
                Expanded(
                  child: Text(
                    'Birthday spin available (placeholder).',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: GGColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Seasonal glow',
            subtitle: 'Promos and featured looks (placeholder)',
          ),
          SizedBox(
            height: 150,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: const [
                _PromoCard(
                  title: 'Spring set',
                  subtitle: 'Soft pinks + chrome',
                  icon: Icons.spa_rounded,
                ),
                SizedBox(width: 12),
                _PromoCard(
                  title: 'Glow upgrade',
                  subtitle: 'Add a luxe finish',
                  icon: Icons.auto_awesome_rounded,
                ),
                SizedBox(width: 12),
                _PromoCard(
                  title: 'Member perk',
                  subtitle: 'Bonus stamp day',
                  icon: Icons.star_rounded,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: (MediaQuery.of(context).size.width - (GGTokens.space6 * 2) - 12) / 2,
      child: GGCard(
        onTap: onTap,
        padding: const EdgeInsets.all(GGTokens.space4),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: GGColors.pink.withValues(alpha: 0.16),
              ),
              child: Icon(icon, color: GGColors.pink),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 260,
      child: GGCard(
        padding: const EdgeInsets.all(GGTokens.space5),
        child: Row(
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    GGColors.roseGold.withValues(alpha: 0.9),
                    GGColors.pink.withValues(alpha: 0.9),
                  ],
                ),
              ),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(width: GGTokens.space4),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: GGColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

