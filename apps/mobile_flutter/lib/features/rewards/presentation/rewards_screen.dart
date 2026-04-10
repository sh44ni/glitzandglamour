import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';
import '../../../app/widgets/stamp_tracker.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Rewards',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(GGTokens.space6),
        children: [
          const SectionHeader(
            title: 'Stamp tracker',
            subtitle: 'Every visit brings you closer',
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
          ),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Member perks',
            subtitle: 'Wallet pass, review codes, and birthday treats',
          ),
          GGCard(
            onTap: () => context.go('/rewards/wallet-pass'),
            child: _RowCTA(
              icon: Icons.wallet_rounded,
              title: 'Add your digital card',
              subtitle: 'Wallet pass (placeholder)',
            ),
          ),
          const SizedBox(height: 12),
          GGCard(
            onTap: () => context.go('/rewards/review-reward'),
            child: _RowCTA(
              icon: Icons.redeem_rounded,
              title: 'Review reward code',
              subtitle: 'Promo code screen (placeholder)',
            ),
          ),
          const SizedBox(height: GGTokens.space5),
          const SectionHeader(
            title: 'Birthday spin',
            subtitle: 'A special surprise for your month',
          ),
          GGCard(
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14),
                    color: GGColors.roseGold.withValues(alpha: 0.16),
                  ),
                  child: const Icon(Icons.cake_rounded, color: GGColors.roseGold),
                ),
                const SizedBox(width: GGTokens.space4),
                Expanded(
                  child: Text(
                    'Birthday spin area (placeholder).',
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
            title: 'Reward history',
            subtitle: 'Your recent redemptions (placeholder)',
          ),
          GGCard(
            child: Text(
              'No reward history yet.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: GGColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RowCTA extends StatelessWidget {
  const _RowCTA({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            color: GGColors.pink.withValues(alpha: 0.12),
          ),
          child: Icon(icon, color: GGColors.pink),
        ),
        const SizedBox(width: GGTokens.space4),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
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
        const Icon(Icons.chevron_right_rounded, color: GGColors.textDim),
      ],
    );
  }
}

