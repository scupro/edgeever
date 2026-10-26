import XCTest
@testable import EdgeEver

final class MemoTemplatesTests: XCTestCase {
    func testCreateSeedFromSelectableTemplate() {
        let template = SelectableMemoTemplate(MemoTemplate(
            id: "tpl",
            name: "我的週報",
            description: "desc",
            title: "【週報】",
            contentMarkdown: "## 本週",
            tags: ["work", "weekly"],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
        ))
        XCTAssertEqual(template.createSeed.title, "【週報】")
        XCTAssertEqual(template.createSeed.contentMarkdown, "## 本週")
        XCTAssertEqual(template.createSeed.tagsText, "work, weekly")
        XCTAssertTrue(template.createSeed.hasContent)
        XCTAssertFalse(CreateMemoSeed(title: "", contentMarkdown: "", tagsText: "").hasContent)
        XCTAssertTrue(CreateMemoSeed(title: "a", contentMarkdown: "", tagsText: "").hasContent)
    }

    func testFromSavedMapsServerTemplate() {
        let saved = MemoTemplate(
            id: "tpl_1",
            name: "自定義",
            description: "說明",
            title: nil,
            contentMarkdown: "# Hi",
            tags: ["x"],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z"
        )
        let row = SelectableMemoTemplate(saved)
        XCTAssertEqual(row.title, "自定義")
        XCTAssertEqual(row.contentMarkdown, "# Hi")
    }
}
