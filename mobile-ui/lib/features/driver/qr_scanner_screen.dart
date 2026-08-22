import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../services/driver_service.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/app_text_field.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final _tokenController = TextEditingController(text: 'QR_WET_89234');
  String? _scanMessage;
  bool _isSuccess = false;

  @override
  void dispose() {
    _tokenController.dispose();
    super.dispose();
  }

  void _verifyToken() {
    final token = _tokenController.text.trim();
    final driverService = context.read<DriverService>();

    final ok = driverService.scanQrToken(token);
    setState(() {
      _isSuccess = ok;
      if (ok) {
        _scanMessage = 'QR Verified! Batch $token verified & status updated to IN_TRANSIT.';
      } else {
        _scanMessage = 'Invalid or expired QR Token. Please check token string.';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutralDark,
      appBar: AppBar(
        backgroundColor: AppColors.neutralDark,
        elevation: 0,
        title: const Text('QR Code Verification', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              const SizedBox(height: 20),
              // Viewfinder Mock Box
              Container(
                width: double.infinity,
                height: 260,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.primary, width: 2),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(LucideIcons.qrCode, size: 80, color: AppColors.primary),
                    SizedBox(height: 16),
                    Text(
                      'Position QR Token inside Viewfinder',
                      style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Manual Input Box
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Manual QR Token Entry',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.neutralDark),
                    ),
                    const SizedBox(height: 8),
                    AppTextField(
                      label: 'QR Code String',
                      hint: 'e.g. QR_WET_89234',
                      controller: _tokenController,
                      prefixIcon: LucideIcons.scan,
                    ),
                    const SizedBox(height: 16),
                    AppButton(
                      label: 'Verify QR Code Token',
                      icon: LucideIcons.checkCircle2,
                      onPressed: _verifyToken,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              if (_scanMessage != null)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _isSuccess ? AppColors.successBg : AppColors.dangerBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _isSuccess ? AppColors.successBorder : AppColors.dangerBorder),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _isSuccess ? LucideIcons.checkCircle2 : LucideIcons.alertCircle,
                        color: _isSuccess ? AppColors.successText : AppColors.dangerText,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _scanMessage!,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _isSuccess ? AppColors.successText : AppColors.dangerText,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
