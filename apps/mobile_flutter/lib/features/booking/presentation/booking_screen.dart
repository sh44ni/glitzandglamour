import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme/gg_colors.dart';
import '../../../app/theme/gg_tokens.dart';
import '../../../app/widgets/gg_card.dart';
import '../../../app/widgets/section_header.dart';

enum BookingMode { web, native }

final bookingModeProvider =
    NotifierProvider<BookingModeController, BookingMode>(BookingModeController.new);

class BookingModeController extends Notifier<BookingMode> {
  @override
  BookingMode build() => BookingMode.web;

  void setMode(BookingMode mode) => state = mode;
}

class BookingScreen extends ConsumerWidget {
  const BookingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(bookingModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Book',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(GGTokens.space6),
        children: [
          const SectionHeader(
            title: 'Book your next appointment',
            subtitle: 'We can use web booking now and swap to native later.',
          ),
          const SizedBox(height: GGTokens.space4),
          SegmentedButton<BookingMode>(
            segments: const [
              ButtonSegment(value: BookingMode.web, label: Text('Web booking')),
              ButtonSegment(value: BookingMode.native, label: Text('Native (soon)')),
            ],
            selected: {mode},
            onSelectionChanged: (s) => ref.read(bookingModeProvider.notifier).setMode(s.first),
          ),
          const SizedBox(height: GGTokens.space5),
          if (mode == BookingMode.web)
            GGCard(
              onTap: () async {
                final url = Uri.parse('https://glitzandglamourstudio.setmore.com/');
                await launchUrl(url, mode: LaunchMode.externalApplication);
              },
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      color: GGColors.pink.withValues(alpha: 0.16),
                    ),
                    child: const Icon(Icons.open_in_new_rounded, color: GGColors.pink),
                  ),
                  const SizedBox(width: GGTokens.space4),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Open web booking',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Temporary option: use the existing booking flow.',
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
              ),
            )
          else
            GGCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Native booking (placeholder)',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'UI is ready to be swapped to a native service selection + schedule flow later.',
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

