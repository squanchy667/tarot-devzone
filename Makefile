.PHONY: build-DevZoneApi check-parity

# Verify C#/TS enum parity between the Unity game and shared/enums.ts
# (override Unity path with UNITY_SRC=/path/to/Assets/Scripts)
check-parity:
	npx tsx scripts/check-enum-parity.ts

build-DevZoneApi:
	# Copy server dist to artifacts
	cp -r server/dist $(ARTIFACTS_DIR)/dist
	# Copy package.json without the shared workspace dep
	sed '/@tarot-devzone\/shared/d' server/package.json > $(ARTIFACTS_DIR)/package.json
	# Install production deps in artifacts dir
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	# Copy shared package into artifacts node_modules
	mkdir -p $(ARTIFACTS_DIR)/node_modules/@tarot-devzone/shared/dist
	cp shared/package.json $(ARTIFACTS_DIR)/node_modules/@tarot-devzone/shared/
	cp -r shared/dist/* $(ARTIFACTS_DIR)/node_modules/@tarot-devzone/shared/dist/
