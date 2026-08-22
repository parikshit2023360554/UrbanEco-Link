import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_ui/main.dart';

void main() {
  testWidgets('App renders splash screen initially', (WidgetTester tester) async {
    await tester.pumpWidget(const UrbanEcoLinkApp());
    expect(find.text('UrbanEco-Link'), findsWidgets);
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
