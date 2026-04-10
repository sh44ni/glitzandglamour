import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'gg_colors.dart';
import 'gg_tokens.dart';

class GGTheme {
  GGTheme._();

  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    final poppins = GoogleFonts.poppinsTextTheme(base.textTheme).apply(
          bodyColor: GGColors.textPrimary,
          displayColor: GGColors.textPrimary,
        );

    final scheme = const ColorScheme.dark(
      primary: GGColors.pink,
      onPrimary: Colors.white,
      secondary: GGColors.roseGold,
      onSecondary: Colors.white,
      surface: GGColors.surface,
      onSurface: GGColors.textPrimary,
      error: Color(0xFFFF4D4D),
      onError: Colors.white,
    );

    return base.copyWith(
      colorScheme: scheme,
      scaffoldBackgroundColor: GGColors.black,
      textTheme: poppins,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: GGColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(GGTokens.radiusMd),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.06),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(GGTokens.radiusSm),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.10)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(GGTokens.radiusSm),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.10)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(GGTokens.radiusSm),
          borderSide: const BorderSide(color: GGColors.pink),
        ),
      ),
    );
  }
}

