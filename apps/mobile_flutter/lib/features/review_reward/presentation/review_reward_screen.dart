import 'package:flutter/material.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';

class ReviewRewardScreen extends StatelessWidget {
  const ReviewRewardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Review reward',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(GGTokens.space6),
        children: [
          const SectionHeader(
            title: 'Promo code',
            subtitle: 'Earn a reward for leaving a review (placeholder)',
          ),
          GGCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your code',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: GGColors.textMuted,
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  'GLITZ-REVIEW-XXXX',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.4,
                      ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Connect this to your backend to generate and validate codes.',
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
    );
  }
}

