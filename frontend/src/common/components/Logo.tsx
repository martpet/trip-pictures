import { Flex, View } from '@adobe/react-spectrum';
import { Link, useRoute } from 'wouter';

export function Logo() {
  const [isRootPath] = useRoute('/');
  const isLink = isRootPath;

  return isLink ? (
    <LogoType />
  ) : (
    <Link href="/">
      <a style={{ color: 'inherit', textDecoration: 'none' }}>
        <LogoType />
      </a>
    </Link>
  );
}

function LogoType() {
  return (
    <View
      width="static-size-400"
      height="static-size-400"
      borderRadius="large"
      borderWidth="thick"
      borderColor="gray-500"
      UNSAFE_style={{ lineHeight: 1 }}
    >
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      <Flex height="100%" justifyContent="center" alignItems="center">
        TP
      </Flex>
    </View>
  );
}
